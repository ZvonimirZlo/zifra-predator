import { startBootSequence } from './Modules/bootSequence.js'

import {
  setTheme,
  toggleSidebar,
  translator,
  startDecayCountdown
} from './Modules/sidebarControllers.js'
import {
  togglePassword,
  updateStrength,
  terminalCopy,
  terminalPaste,
  terminalPurge,
  initCursor,
  arrowKeyNavigator,
  terminalActions
} from './Modules/utils.js'
import { toggleMute } from './Modules/soundControl.js'
import { initCubeListeners } from './Modules/cubeControllers.js'
import { cryptoProcessors } from './Modules/cryptoEngine.js'
import {
  generateQR,
  copyQR,
  scanQRData,
  initDecrypterScanner,
  downloadQR,
  initQRDropZone,
  initQRController
} from './Modules/QRActions'

// const sidebar = document.getElementById('sidebar')
const sequencer = document.getElementById('boot-sequencer')
const glyph = sequencer.querySelector('.countdown-glyph')
const startBtn = document.querySelector('.start')
const startingPoint = document.querySelector('.starting-point')



initCubeListeners() //Triggers cube listeners
initCursor() //Triggers 'predator' aiming cursor
initQRDropZone('#decrypter_input') //Allows dropping the QR code directly
initDecrypterScanner() //Decrypt scanner initialization
arrowKeyNavigator() //Arrow key trigger
initQRController() //Initialize QR controller
terminalActions() //Copy,paste,purge
cryptoProcessors() //Crypto processing


document.getElementById('sidebar').addEventListener('mouseenter', translator, { once: true }) //Unlocks the sidebar

// --- DOM ELEMENTS ---

//Starting the app
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


// --- UI CONTROLS ---

const initTheme = () => {
  //Change themes
document
  .getElementById('green')
  .addEventListener('click', () => setTheme('green'))
document
  .getElementById('blue')
  .addEventListener('click', () => setTheme('blue'))
}

const initSidebarVisibility = () => {
  //Toggle sidebar visibility
document.querySelector('.menu-toggle').addEventListener('click', toggleSidebar)
}

const initStealthMode = () => {
  // Toggle mute/unmute sounds
document.querySelector('.stealth').addEventListener('click', toggleMute)
}

const initRebootSequence = () => {
  //Triggers countdown and browser reload
document.getElementById('kill-button').addEventListener('click', startDecayCountdown)
}

const initPasswordStrength = () => {
  // --- PASSWORD & STRENGTH ---
document.querySelectorAll('.toggle-visibility').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation() // Prevents the click from triggering other things
    togglePassword(e.currentTarget)
  })
})
}

const initPasswordStrengthUpdate = () => {
  document.querySelectorAll('.passInput').forEach(input => {
  input.addEventListener('input', e => updateStrength(e.target))
})
}

initTheme()
initSidebarVisibility()
initStealthMode()
initRebootSequence()
initPasswordStrength()
initPasswordStrengthUpdate()


