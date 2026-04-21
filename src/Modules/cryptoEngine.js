import {sfx} from './soundControl.js'
import { showTerminalAlert } from './animations';


// --- MASKING CONFIGURATION ---
const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const MASK_CHARS = B64_CHARS.split('').reverse().join('');

function applyMask(str) {
    return str.split('').map(char => {
        const index = B64_CHARS.indexOf(char);
        return index !== -1 ? MASK_CHARS[index] : char;
    }).join('');
}

function removeMask(str) {
    return str.split('').map(char => {
        const index = MASK_CHARS.indexOf(char);
        return index !== -1 ? B64_CHARS[index] : char;
    }).join('');
}

// --- CORE CRYPTO FUNCTIONS ---
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
        "raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false, ["encrypt", "decrypt"]
    );
}

//Encryption logic
async function encryptBatch(messages, password) {
    const encoder = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(password, salt);

    return Promise.all(messages.map(async (msg) => {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const buffer = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(msg));
        const saltB64 = btoa(String.fromCharCode(...salt));
        const ivB64 = btoa(String.fromCharCode(...iv));
        const contentB64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        return applyMask(`${saltB64}:${ivB64}:${contentB64}`);
    }));
}


//Decryption logic
async function decryptBatch(encryptedMessages, password) {
    const decoder = new TextDecoder();
    const b64ToUint8 = (b64) => {
        try {
            return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        } catch (e) {
            throw new Error("Invalid Base64");
        }
    };

    return Promise.all(encryptedMessages.map(async (entry) => {
        try {
            const cleanEntry = removeMask(entry.trim());
            const parts = cleanEntry.split(':');
            
            if (parts.length !== 3) throw new Error("Invalid format");

            const [sB64, iB64, cB64] = parts;
            const salt = b64ToUint8(sB64);
            const iv = b64ToUint8(iB64);
            const data = b64ToUint8(cB64);

            // Re-derive the key using the password and the salt from the message
            const key = await deriveKey(password, salt);

            // AES-GCM will automatically throw an error here if the password/key is wrong
            const buffer = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv }, 
                key, 
                data
            );

            return decoder.decode(buffer);
        } catch (e) {
            // This is the "Wrong Password" trigger
            console.error("Decryption failed:", e);
            return "!!! ACCESS DENIED: INVALID KEY !!!";
        }
    }));
}

export async function handleEncrypt() {

    const face = document.querySelector('.cube-face-front');
    const passInput = face.querySelector('.passInput');
    const mainInput = face.querySelector('.mainInput');
    const output = face.querySelector('.resultOutput');

    // console.log("2. Inputs found:", { 
    //     passLength: passInput.value.length, 
    //     textLength: mainInput.value.length,
    //     hasOutputElement: !!output 
    // });

    if (!passInput.value || !mainInput.value) {
        console.log("3. Validation Failed - Stopping");
        return showTerminalAlert("Need password and text!"),sfx.alert.play();
    }

    try {
        // console.log("4. Starting Encryption...");
        const res = await encryptBatch([mainInput.value], passInput.value);
        // console.log("5. Encryption Success:", res[0]);

        if (output.tagName === 'TEXTAREA' || output.tagName === 'INPUT') {
            output.value = res[0];
        } else {
            output.innerText = res[0];
        }
        
        sfx.success.play();
        console.log("6. UI Updated");
    } catch (err) {
        console.error("CRITICAL ERROR:", err);
    }finally {
    // CRITICAL: Zero out password in memory
    passInput.value = '';
    mainInput.value = '';
    
    // Force garbage collection hints
    password = null;
    if (typeof global.gc === 'function') global.gc();
  }
}

export async function handleDecrypt() {
    const face = document.querySelector('.cube-face-right');
    const pass = face.querySelector('.passInput').value;
    const text = face.querySelector('.mainInput').value;
    const output = face.querySelector('.resultOutput');
    sfx.click.play()
    if (!pass || !text) return showTerminalAlert("Need password and encrypted text!"),alert.play();

    const res = await decryptBatch([text], pass);
    output.value = res[0];

    if (output.tagName === 'TEXTAREA' || output.tagName === 'INPUT') {
        output.value = res[0];
    } else {
        output.innerText = res[0];
    }
    
    // console.log("SUCCESS: Encrypted data is: ", res[0]);
    

    if (res[0].includes("ACCESS DENIED")) {
        sfx.error.play()
        anime({
            targets: output,
            // Flash red and shake
            backgroundColor: ['rgba(255,0,0,0)', 'rgba(255,0,0,0.4)', 'rgba(255,0,0,0)'],
            translateX: [-10, 10, -10, 10, 0],
            duration: 400,
            easing: 'linear'
        });
        
        output.style.color = "#ff4c4c";
        setTimeout(() => { output.style.color = "#00ff41"; }, 1000);
    }else{
        sfx.success.play()
    }
}

// --- CRYPTO PROCESSORS
export const cryptoProcessors = () => {
  const encryptBtn = document.querySelector(
  '.cube-face-front .panel-content > button:not(.toggle-visibility)'
)
const decryptBtn = document.querySelector(
  '.cube-face-right .panel-content > button:not(.toggle-visibility)'
)

if (encryptBtn) encryptBtn.addEventListener('click', handleEncrypt)
if (decryptBtn) decryptBtn.addEventListener('click', handleDecrypt)
}