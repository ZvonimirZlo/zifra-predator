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
  initCursor,
  arrowKeyNavigator
} from './Modules/utils.js'
import { toggleMute } from './Modules/soundControl.js'
import { initCubeListeners } from './Modules/cubeControllers.js'
import { handleDecrypt, handleEncrypt } from './Modules/cryptoEngine.js'
// import { triggerTitleScramble, startBootSequence } from './Modules/bootSequence'
import { generateQR, copyQR, scanQRData, initDecrypterScanner, downloadQR, initQRDropZone } from './Modules/QRActions'

const audioP = new Audio('/Sounds/predator-aiming.ogg')

initCubeListeners()//Triggers cube listeners
initCursor()//Triggers 'predator' aiming cursor
initQRDropZone('#decrypter_input'); //Allows dropping the QR code directly
initDecrypterScanner(); //Decrypt scanner initialization
arrowKeyNavigator(); //Arrow key trigger

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
sidebar.addEventListener('mouseenter', translator, { once: true }) //Unlocks the sidebar

// --- UI CONTROLS ---

//Change themes
document
  .getElementById('green')
  .addEventListener('click', () => setTheme('green'))
document
  .getElementById('blue')
  .addEventListener('click', () => setTheme('blue'))

//Toggle sidebar visibility
toggleMenu.addEventListener('click', toggleSidebar)

// Toggle mute/unmute sounds
document.querySelector('.stealth').addEventListener('click', toggleMute)


//Triggers countdown and browser reload
killBtn.addEventListener('click', startDecayCountdown)


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
async function handleQRExtract() {
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


document.addEventListener('click', async (e) => {

    
    const bioBtn = e.target.closest('.btn-bio-key');
    const copyBtn = e.target.closest('#copy_qr_btn');
    const closeBtn = e.target.closest('#close_qr');

    if (bioBtn) {
        console.log("MATCH: Bio-Key detected.");
        await handleQRExtract();
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

