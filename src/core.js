import { startBootSequence } from './Modules/bootSequence.js'

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

const sidebar = document.getElementById('sidebar')
const toggleMenu = document.querySelector('.menu-toggle')
const stealthBtn = document.querySelector('.stealth')
const killBtn = document.getElementById('kill-button')
const sequencer = document.getElementById('boot-sequencer')
// const glyph = sequencer.querySelector('.countdown-glyph')
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


sidebar.addEventListener('mouseenter', translator, { once: true }) //Unlocks the sidebar

// --- DOM ELEMENTS ---


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






// ------------------------------------------
