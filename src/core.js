import {
  setTheme,
  toggleSidebar,
  translator,
  startDecayCountdown
} from './Modules/animations'
import {
  togglePassword,
  updateStrength,
  terminalCopy,
  terminalPaste,
  terminalPurge,
  initCursor
} from './Modules/utils.js'
import { toggleMute } from './Modules/soundControl.js'
import { initCubeListeners } from './Modules/cubeControllers.js'
import { handleDecrypt, handleEncrypt } from './Modules/cryptoEngine.js'
// import { triggerTitleScramble, startBootSequence } from './Modules/bootSequence'
import { generateQR, copyQR, scanQRData, initDecrypterScanner, downloadQR, initQRDropZone } from './Modules/QRActions'

const audioP = new Audio('/Sounds/predator-aiming.ogg')

initCubeListeners()
initCursor()
initQRDropZone('#decrypter_input'); //Allows dropping the QR code directly

// --- DOM ELEMENTS ---

const sidebar = document.getElementById('sidebar')
const toggleMenu = document.querySelector('.menu-toggle')
const stealthBtn = document.querySelector('.stealth')
const killBtn = document.getElementById('kill-button')
const sequencer = document.getElementById('boot-sequencer')
// const glyph = sequencer.querySelector('.countdown-glyph')
const startBtn = document.querySelector('.start')
const startingPoint = document.querySelector('.starting-point')

// startBtn.addEventListener('click', () => {
//   startingPoint.style.display = 'block'
//   startBtn.style.display = 'none'
//   // Gives the browser a split second to render the 'block'
//   // change before firing the heavy logic
//   document.getElementById('btn1').focus();
//   setTimeout(() => {
//     startBootSequence()
//   }, 100)
// })

// // Call the function
// document.addEventListener('DOMContentLoaded', triggerTitleScramble)

// --- INITIALIZATION ---
sidebar.addEventListener('mouseenter', translator, { once: true })

// --- UI CONTROLS ---
document
  .getElementById('green')
  .addEventListener('click', () => setTheme('green'))
document
  .getElementById('blue')
  .addEventListener('click', () => setTheme('blue'))
toggleMenu.addEventListener('click', toggleSidebar)
stealthBtn.addEventListener('click', toggleMute)
killBtn.addEventListener('click', startDecayCountdown)
// Wiring the stealth button
document.querySelector('.stealth').addEventListener('click', toggleMute)

// --- PASSWORD & STRENGTH ---
document.querySelectorAll('.toggle-visibility').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation() // Prevents the click from triggering other things
    togglePassword(e.currentTarget)
  })
})

document.querySelectorAll('.passInput').forEach(input => {
  input.addEventListener('input', e => updateStrength(e.target))
})

// --- CRYPTO PROCESSORS
const encryptBtn = document.querySelector(
  '.cube-face-front .panel-content > button:not(.toggle-visibility)'
)
const decryptBtn = document.querySelector(
  '.cube-face-right .panel-content > button:not(.toggle-visibility)'
)

if (encryptBtn) encryptBtn.addEventListener('click', handleEncrypt)
if (decryptBtn) decryptBtn.addEventListener('click', handleDecrypt)

// --- TERMINAL ACTIONS (Copy/Paste/Purge) ---
document.querySelectorAll('.control-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const face = e.target.closest('.cube-face')
    const selector = face.classList.contains('cube-face-front')
      ? '.cube-face-front'
      : '.cube-face-right'

    if (btn.innerText.includes('LINK_DATA')) {
      terminalPaste(`${selector} .mainInput`)
    } else if (btn.innerText.includes('PURGE')) {
      terminalPurge(`${selector} .mainInput`)
    } else if (btn.innerText.includes('CLONE_EXTRACT')) {
      terminalCopy(e, `${selector} .resultOutput`)
    }
  })
})

// ------------------------------------------

// --- THE EXECUTIONER LOGIC ---
async function handleBioExtract() {
    console.log("INTERNAL: handleBioExtract sequence started"); // Log 1
    const outputArea = document.getElementById('encrypted_output');
    const encryptedText = outputArea.value || outputArea.innerText;

    if (!encryptedText || encryptedText.trim().length < 10) {
        console.warn("GUARD: Text too short or missing.");
        return;
    }

    // Call the module
    await generateQR(encryptedText, 'qr_canvas', 'qr_overlay');

    // UI Feedback
    anime({
        targets: '#qr_overlay',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 400,
        easing: 'easeOutExpo'
    });
}

// --- THE ONLY CLICK LISTENER YOU NEED ---
document.addEventListener('click', async (e) => {
    // This log MUST fire if the click hits the document
    console.log("GLOBAL CLICK:", e.target.tagName, e.target.className, e.target.id);

    // Use e.target.closest for better accuracy with icons/styled buttons
    const bioBtn = e.target.closest('.btn-bio-key');
    const copyBtn = e.target.closest('#copy_qr_btn');
    const closeBtn = e.target.closest('#close_qr');

    if (bioBtn) {
        console.log("MATCH: Bio-Key detected.");
        await handleBioExtract();
    }

    if (copyBtn) {
        console.log("MATCH: Copy detected.");
        const success = await copyQR('qr_canvas');
        // if (success) showTerminalAlert("SIGNATURE_COPIED");
    }

    if (closeBtn) {
        console.log("MATCH: Close detected.");
        const overlay = document.getElementById('qr_overlay');
        anime({
            targets: overlay,
            opacity: 0,
            scale: 0.8,
            duration: 300,
            easing: 'easeInExpo',
            complete: () => { overlay.style.display = 'none'; }
        });
    }
});

initDecrypterScanner();










//Arrow key navigator
window.addEventListener('keydown', (e) => {
    // 1. Get Sidebar items
    const sidebarItems = Array.from(document.querySelectorAll('#sidebar button, .theme-btn, .stealth, .kill-btn'));
    
    // 2. Get ONLY the visible cube face's inputs/buttons
    // We look for the face that DOES NOT have a 'hidden' state or is currently 'show-X'
    const activeFace = document.querySelector('.cube-face:not([style*="display: none"])'); 
    const faceItems = activeFace ? Array.from(activeFace.querySelectorAll('input, textarea, button')) : [];

    // 3. Combine them into one master list for this specific view
    const allItems = [...sidebarItems, ...faceItems];
    
    const active = document.activeElement;
    const currentIndex = allItems.indexOf(active);

    if (currentIndex > -1) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            
            let nextIndex = (e.key === 'ArrowDown') 
                ? (currentIndex + 1) % allItems.length 
                : (currentIndex - 1 + allItems.length) % allItems.length;
            
            allItems[nextIndex].focus();
            
            // Optional: Add a subtle sound or log for feedback
            console.log(`Navigating to: ${allItems[nextIndex].className || allItems[nextIndex].id}`);
        }
    }
}, { capture: true });