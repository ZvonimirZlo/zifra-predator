import { sfx } from './soundControl.js'
import { showTerminalAlert } from './terminalAlert'

// ==========================================
// UNIFIED RUNTIME STATE
// ==========================================
let currentPayload = {
  binaryData: null, // Always holds an ArrayBuffer (for text or files)
  fileName: '',     // Stores the original filename if a file/video was processed
  isText: true      // Flag to guide UI output choices (preview vs download)
};

const MAX_PREVIEW_LENGTH = 50000;

// ==========================================
// STACK-SAFE UTILITIES & ENGINE
// ==========================================
async function deriveKey (password, salt) {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function uint8ArrayToBase64 (uint8) {
  let binary = '';
  const chunkSide = 8192;
  for (let i = 0; i < uint8.length; i += chunkSide) {
    binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunkSide));
  }
  return btoa(binary);
}

function b64ToUint8 (b64) {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// ==========================================
// UNIFIED CRYPTO CORE (Raw Byte Processing)
// ==========================================
async function encryptData (arrayBuffer, password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  );

  return [
    uint8ArrayToBase64(salt),
    uint8ArrayToBase64(iv),
    uint8ArrayToBase64(new Uint8Array(encryptedBuffer))
  ].join(':');
}

async function decryptData (encryptedString, password) {
  const parts = encryptedString.trim().split(':');
  if (parts.length !== 3) throw new Error('MALFORMED_DATA');

  const salt = b64ToUint8(parts[0]);
  const iv = b64ToUint8(parts[1]);
  const ciphertext = b64ToUint8(parts[2]);
  const key = await deriveKey(password, salt);

  // Throws naturally on bad password/integrity failure
  return await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
}

// ==========================================
// DATA NORMALIZATION HELPERS
// ==========================================
async function ingestFilePayload (file) {
  currentPayload.binaryData = await file.arrayBuffer();
  currentPayload.fileName = file.name;
  currentPayload.isText = file.type.startsWith('text/') || file.name.endsWith('.enc');
}

function ingestTextPayload (textString) {
  currentPayload.binaryData = new TextEncoder().encode(textString).buffer;
  currentPayload.fileName = '';
  currentPayload.isText = true;
}

function triggerFileDownload (arrayBuffer, filename, defaultExt = '.enc') {
  const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.includes('.') ? filename : `${filename}${defaultExt}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// INTERFACE EXECUTION CONTROLLERS
// ==========================================
export async function handleEncrypt () {
  const face = document.querySelector('.cube-face-front');
  const passInput = face.querySelector('.passInput');
  const mainInput = face.querySelector('.mainInput');
  const output = face.querySelector('.resultOutput');
  const strengthBar = document.querySelector('.strength-bar');
  const strengthLabel = document.querySelector('.strength-label');

  const downloadPrompt = document.getElementById('encryptDownloadPrompt');
  const secureDownloadBtn = document.getElementById('encryptDownloadBtn');

  if (!passInput.value) return showTerminalAlert('Password required!'), sfx.alert.play();

  if (!currentPayload.binaryData) {
    if (!mainInput.value) return showTerminalAlert('No data to encrypt!'), sfx.alert.play();
    ingestTextPayload(mainInput.value);
  }

  try {
    const encryptedResult = await encryptData(currentPayload.binaryData, passInput.value);
    sfx.success.play();

    // Determine if it needs to go to a file prompt
    if (!currentPayload.isText || encryptedResult.length > MAX_PREVIEW_LENGTH) {
      // 1. Hide terminal output window, show download prompt
      output.style.display = 'none';
      downloadPrompt.style.display = 'block';

      // 2. Clone button to cleanly strip away any lingering previous click events
      const newBtn = secureDownloadBtn.cloneNode(true);
      secureDownloadBtn.parentNode.replaceChild(newBtn, secureDownloadBtn);

      const capturedFileName = currentPayload.fileName || 'encrypted_payload.bin';

      newBtn.addEventListener('click', () => {
        sfx.click.play();
        
        // Keeps the full name and tacks .enc on the end (e.g., "fileName.txt.enc") to avoid opening raw encrypted file
        const outName = `${capturedFileName}.enc`;
        
        triggerFileDownload(new TextEncoder().encode(encryptedResult), outName);
       //On download complete sequence
        newBtn.disabled = true;
        newBtn.innerText = 'DOWNLOAD_COMPLETE';
        setTimeout(() => {
          downloadPrompt.style.display = 'none';
          output.style.display = 'block';
          showTerminalAlert(`[SUCCESS] Encrypted bundle built dynamically.`);
          newBtn.disabled = false;
          newBtn.innerText = 'Download Secure File';
        }, 2000);
      }, { once: true });

    } else {
      output.style.display = 'block';
      downloadPrompt.style.display = 'none';
      output.value = encryptedResult;
    }
  } catch (err) {
    console.error('Encryption Failed:', err);
    sfx.error.play();
  } finally {
    passInput.value = '';
    mainInput.value = '';
    mainInput.readOnly = false;
    currentPayload = { binaryData: null, fileName: '', isText: true };
    strengthBar.style.width = 0;
    strengthLabel.innerText = 'STRENGTH: EMPTY';
    strengthLabel.style.color = "#38B6FF";
  }
}

export async function handleDecrypt () {
  const face = document.querySelector('.cube-face-right');
  const passInput = face.querySelector('.passInput');
  const mainInput = face.querySelector('.mainInput');
  const output = face.querySelector('.resultOutput');

  const downloadPrompt = document.getElementById('decryptDownloadPrompt');
  const secureDownloadBtn = document.getElementById('decryptDownloadBtn');

  if (!passInput.value) return showTerminalAlert('Password required!'), sfx.alert.play();

  if (!currentPayload.binaryData) {
    if (!mainInput.value) return showTerminalAlert('No data to decrypt!'), sfx.alert.play();
    ingestTextPayload(mainInput.value);
  }

  try {
    const ciphertextString = new TextDecoder().decode(currentPayload.binaryData);
    const decryptedBuffer = await decryptData(ciphertextString, passInput.value);
    
    sfx.success.play();

    // Determine if it needs to go to a file prompt or if the input is plain text
    if (!currentPayload.isText || decryptedBuffer.byteLength > MAX_PREVIEW_LENGTH) {
      output.style.display = 'none';
      downloadPrompt.style.display = 'block';

      const newBtn = secureDownloadBtn.cloneNode(true);
      secureDownloadBtn.parentNode.replaceChild(newBtn, secureDownloadBtn);

      const capturedFileName = currentPayload.fileName;

      newBtn.addEventListener('click', () => {
        sfx.click.play();
        
        let restoredName = 'decrypted_payload.bin';
        if (capturedFileName) {
          // If it ends with .enc, slice off the last 4 characters to reveal the exstension before encryption, for example: "fileName.txt"
          restoredName = capturedFileName.toLowerCase().endsWith('.enc')
            ? capturedFileName.slice(0, -4)
            : capturedFileName;
        }
        
        triggerFileDownload(decryptedBuffer, restoredName);

        newBtn.disabled = true;
        newBtn.innerText = 'DOWNLOAD_COMPLETE';
        setTimeout(() => {
          downloadPrompt.style.display = 'none';
          output.style.display = 'block';
          output.value = `[SUCCESS] Payload unlocked and extracted.`;
          newBtn.disabled = false;
          newBtn.innerText = 'Download Decrypted File';
        }, 2000);
      }, { once: true });

    } else {
      output.style.display = 'block';
      downloadPrompt.style.display = 'none';
      output.value = new TextDecoder().decode(decryptedBuffer);
    }
  } catch (err) {
    console.error('Auth Failure:', err);
    sfx.error.play();
    output.value = '!!! ACCESS DENIED: INVALID KEY OR CORRUPTED DATA !!!';
    
    window.anime?.({
      targets: output,
      backgroundColor: ['rgba(255,0,0,0)', 'rgba(255,0,0,0.4)', 'rgba(255,0,0,0)'],
      translateX: [-10, 10, -10, 10, 0],
      duration: 400,
      easing: 'linear'
    });
  } finally {
    passInput.value = '';
    mainInput.value = '';
    mainInput.readOnly = false;
    currentPayload = { binaryData: null, fileName: '', isText: true };
  }
}

// ==========================================
// UI DOM EVENT ROUTERS
// ==========================================
export const cryptoProcessors = () => {
  const encryptBtn = document.querySelector('.cube-face-front .panel-content > button:not(.toggle-visibility)');
  const decryptBtn = document.querySelector('.cube-face-right .panel-content > button:not(.toggle-visibility)');
  const encryptInput = document.getElementById('encrypterInput');
  const decryptInput = document.getElementById('decrypter_input');


  const setupDropListeners = (inputEl) => {
    if (!inputEl) return;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eName => {
      inputEl.addEventListener(eName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });

    inputEl.addEventListener('drop', async (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await ingestFilePayload(files[0]);
        inputEl.value = `📎 [FILE ATTACHED]\nName: ${files[0].name}\nSize: ${(files[0].size / 1024).toFixed(1)} KB`;
        inputEl.readOnly = true;
        sfx.click.play();
      }
    }, false);
  };

  setupDropListeners(encryptInput);
  setupDropListeners(decryptInput);

  if (encryptBtn) encryptBtn.addEventListener('click', handleEncrypt);
  if (decryptBtn) decryptBtn.addEventListener('click', handleDecrypt);
};
