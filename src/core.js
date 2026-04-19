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
import { triggerTitleScramble, startBootSequence } from './Modules/bootSequence'

const audioP = new Audio('/Sounds/predator-aiming.ogg')

initCubeListeners()
initCursor()

// --- DOM ELEMENTS ---

const sidebar = document.getElementById('sidebar')
const toggleMenu = document.querySelector('.menu-toggle')
const stealthBtn = document.querySelector('.stealth')
const killBtn = document.getElementById('kill-button')
const sequencer = document.getElementById('boot-sequencer')
// const glyph = sequencer.querySelector('.countdown-glyph')
const startBtn = document.querySelector('.start')
const startingPoint = document.querySelector('.starting-point')

startBtn.addEventListener('click', () => {
  startingPoint.style.display = 'block'
  startBtn.style.display = 'none'
  // Gives the browser a split second to render the 'block'
  // change before firing the heavy logic
  document.getElementById('btn1').focus();
  setTimeout(() => {
    startBootSequence()
  }, 100)
})

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

//
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