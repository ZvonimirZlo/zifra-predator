import { sfx } from './soundControl.js'
import { showTerminalAlert } from './terminalAlert'



async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { 
      name: 'PBKDF2', 
      salt, 
      iterations: 600000,
      hash: 'SHA-256' 
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptBatch(messages, password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  // 1. Derive key ONCE per batch. 
  const key = await deriveKey(password, salt);
  const saltB64 = uint8ArrayToBase64(salt);

  const results = [];
  for (const msg of messages) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(msg);

    const buffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    // 2. Chunked Base64 helper to prevent Stack Overflow
    const ivB64 = uint8ArrayToBase64(iv);
    const contentB64 = uint8ArrayToBase64(new Uint8Array(buffer));

    results.push(`${saltB64}:${ivB64}:${contentB64}`);
  }
  return results;
}

// THE STACK-SAFE HELPER
function uint8ArrayToBase64(uint8) {
  let binary = '';
  const chunkSide = 8192; 
  for (let i = 0; i < uint8.length; i += chunkSide) {
    // Process in small bites to stay under the stack limit
    binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunkSide));
  }
  return btoa(binary);
}


async function decryptBatch(encryptedMessages, password) {
  const decoder = new TextDecoder();
  const results = [];

  // 1. Safety check
  if (!encryptedMessages || encryptedMessages.length === 0) return [];

  try {
    // 2. Extract salt from the first entry to derive the key once
    const firstEntry = encryptedMessages[0].trim().split(':');
    const salt = b64ToUint8(firstEntry[0]);
    
    // The "Heavy Lifting" (600k iterations) happens here, once.
    const key = await deriveKey(password, salt);

    // 3. The Sequential Loop 
    // processes messages one-by-one.
    for (const entry of encryptedMessages) {
      try {
        const parts = entry.trim().split(':');
        if (parts.length !== 3) continue; 

        const iv = b64ToUint8(parts[1]);
        const data = b64ToUint8(parts[2]);

        // Decrypt using the pre-derived key
        const buffer = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          data
        );

        results.push(decoder.decode(buffer));
      } catch (e) {
        console.error("Single message decryption failed:", e);
        results.push('!!! ACCESS DENIED: INVALID KEY OR CORRUPTED DATA !!!');
      }
    }
  } catch (e) {
    console.error("Master key derivation failed:", e);
    throw new Error("Initialization failed. Check your password.");
  }

  return results;
}
function b64ToUint8(b64) {
  // 1. Decode Base64 to a binary string
  const binString = atob(b64);
  const size = binString.length;
  
  // 2. Pre-allocate the exact amount of memory needed
  const bytes = new Uint8Array(size);
  
  // 3. Fill the bucket manually
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  
  return bytes;
}

export async function handleEncrypt () {
  const face = document.querySelector('.cube-face-front')
  const passInput = face.querySelector('.passInput')
  const mainInput = face.querySelector('.mainInput')
  const output = face.querySelector('.resultOutput')

  // console.log("2. Inputs found:", {
  //     passLength: passInput.value.length,
  //     textLength: mainInput.value.length,
  //     hasOutputElement: !!output
  // });

  if (!passInput.value || !mainInput.value) {
    console.log('3. Validation Failed - Stopping')
    return showTerminalAlert('Need password and text!'), sfx.alert.play()
  }

  try {
    // console.log("4. Starting Encryption...");
    const res = await encryptBatch([mainInput.value], passInput.value)
    // console.log("5. Encryption Success:", res[0]);

    if (output.tagName === 'TEXTAREA' || output.tagName === 'INPUT') {
      output.value = res[0]
    } else {
      output.innerText = res[0]
    }

    sfx.success.play()
    console.log('6. UI Updated')
  } catch (err) {
    console.error('CRITICAL ERROR:', err)
  } finally {
    // CRITICAL: Zero out password in memory
    passInput.value = ''
    mainInput.value = ''

    // Force garbage collection
    // passInput = null;
    //     if (typeof global.gc === 'function') global.gc();
  }
}

export async function handleDecrypt () {
  const face = document.querySelector('.cube-face-right')
  const pass = face.querySelector('.passInput').value
  const text = face.querySelector('.mainInput').value
  const output = face.querySelector('.resultOutput')
  sfx.click.play()
  if (!pass || !text)
    return showTerminalAlert('Need password and encrypted text!'), alert.play()

  const res = await decryptBatch([text], pass)
  output.value = res[0]

  if (output.tagName === 'TEXTAREA' || output.tagName === 'INPUT') {
    output.value = res[0]
  } else {
    output.innerText = res[0]
  }

  // console.log("SUCCESS: Encrypted data is: ", res[0]);

  if (res[0].includes('ACCESS DENIED')) {
    sfx.error.play()
    anime({
      targets: output,
      // Flash red and shake
      backgroundColor: [
        'rgba(255,0,0,0)',
        'rgba(255,0,0,0.4)',
        'rgba(255,0,0,0)'
      ],
      translateX: [-10, 10, -10, 10, 0],
      duration: 400,
      easing: 'linear'
    })

    output.style.color = '#ff4c4c'
    setTimeout(() => {
      output.style.color = '#00ff41'
    }, 1000)
  } else {
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
