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
  setTimeout(() => {
    startBootSequence()
  }, 100)
})

// Call the function
document.addEventListener('DOMContentLoaded', triggerTitleScramble)

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
