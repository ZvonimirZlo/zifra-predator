import { showTerminalAlert } from './animations.js';
import {sfx} from './soundControl.js';





export function togglePassword(btn) {
    const input = btn.parentElement.querySelector('.passInput');
    if (input.type === "password") {
        input.type = "text";
        btn.innerText = "🔒";
    } else {
        input.type = "password";
        btn.innerText = "👁️";
    }
}


//Update pass strength
export function updateStrength(inputEl) {
    const pass = inputEl.value;
    // Find the container for THIS specific panel
    const parent = inputEl.closest('.panel-content');
    const bar = parent.querySelector('.strength-bar');
    const label = parent.querySelector('.strength-label');

    let score = 0;
    if (pass.length > 8) score++;
    if (pass.length > 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const colors = ["#ff4c4c", "#ff4c4c", "#ffa500", "#ffd700", "#00ff41", "#00ffff"];
    const labels = ["DANGEROUS", "VERY WEAK", "WEAK", "MEDIUM", "STRONG", "GOD MODE"];

    // Update the UI
    bar.style.width = (score + 1) * 16.6 + "%";
    bar.style.backgroundColor = colors[score];
    bar.style.boxShadow = `0 0 10px ${colors[score]}`;
    label.innerText = "STRENGTH: " + labels[score];
    label.style.color = colors[score];
    if(pass.length === 0) label.innerText = 'STRENGTH: EMPTY', 
    label.style.color = "#38B6FF",
    bar.style.width = 0;
}


//------------------------------------------------------------------------------------
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

// --- UI HANDLERS ---

export async function handleEncrypt() {

    const face = document.querySelector('.cube-face-front');
    const pass = face.querySelector('.passInput').value;
    const text = face.querySelector('.mainInput').value;
    const output = face.querySelector('.resultOutput');
sfx.click.play()
    if (!pass || !text) return showTerminalAlert("Need password and text!"),sfx.alert.play();

    const res = await encryptBatch([text], pass);
    output.innerText = res[0];
    sfx.success.play()
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

//Reusable functions for inputs and outputs handling

//Paste
export async function terminalPaste(selector) {
    sfx.click.play()
    const target = document.querySelector(selector);
    try {
        const text = await navigator.clipboard.readText();
        target.value = text;
        
        // Success Flash
        anime({
            targets: target,
            backgroundColor: ['rgba(0, 255, 65, 0.2)', 'rgba(0, 0, 0, 0.4)'],
            duration: 1000
        });
    } catch (err) {
        console.warn("Clipboard access denied or not available.");
    }
}
 //Delete
export function terminalPurge(selector) {
    sfx.click.play()
    const target = document.querySelector(selector);
    target.value = '';
    
    // Purge Shake
    anime({
        targets: target,
        translateX: [-5, 5, -5, 5, 0],
        duration: 250,
        easing: 'linear'
    });
    sfx.alert.play()
}

//Copy function
export function terminalCopy(event, selector) {
    sfx.click.play()
    const btn = event.currentTarget;
    const originalText = btn.innerText;
    const target = document.querySelector(selector);
    
    //Copy
    navigator.clipboard.writeText(target.value).then(() => {


    btn.innerText = "DATA_CLONED";
    setTimeout(() => btn.innerText = originalText, 2000);
});
    
    // Brief "Copied" alert on the button text
    btn.innerText = "DATA_CLONED";
    
    //Resets to original text
    setTimeout(() => btn.innerText = originalText, 1500);
    sfx.success.play()
}
