const cube = document.getElementById("cube");
const clickOnSide = (side) => {
  const activeSide = cube.dataset.side;
  cube.classList.replace(`show-${activeSide}`, `show-${side}`);
  cube.setAttribute("data-side", side);
};

document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const sideToTurn = e.target.dataset.side;
    clickOnSide(sideToTurn);
  })
});

function togglePassword(btn) {
    // Find the input that is in the same div as this button
    const input = btn.parentElement.querySelector('.passInput');
    if (input.type === "password") {
        input.type = "text";
        btn.innerText = "🔒"; // Change icon when visible
    } else {
        input.type = "password";
        btn.innerText = "👁️";
    }
}

function updateStrength(inputEl) {
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
    if(pass.length === 0) label.innerText = 'STRENGTH: EMPTY';
}



function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}


// --- MASKING CONFIGURATION ---
const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const MASK_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

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

async function handleEncrypt() {

    const face = document.querySelector('.cube-face-front');
    const pass = face.querySelector('.passInput').value;
    const text = face.querySelector('.mainInput').value;
    const output = face.querySelector('.resultOutput');

    if (!pass || !text) return alert("Need password and text!");

    const res = await encryptBatch([text], pass);
    output.innerText = res[0];
}

async function handleDecrypt() {
    const face = document.querySelector('.decrypt-face');
    const pass = face.querySelector('.passInput').value;
    const text = face.querySelector('.mainInput').value;
    const output = face.querySelector('.resultOutput');

    if (!pass || !text) return alert("Need password and encrypted text!");

    const res = await decryptBatch([text], pass);
    output.innerText = res[0];
}
