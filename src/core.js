import { startBootSequence } from './Modules/bootSequence.js'

import {
  setTheme,
  toggleSidebar,
  translator,
  startDecayCountdown,
  initTheme,
  initSidebarVisibility,
  initRebootSequence
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
import { toggleMute, initStealthMode } from './Modules/soundControl.js'
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
} from './Modules/QRActions.js'


// const sidebar = document.getElementById('sidebar')
const sequencer = document.getElementById('boot-sequencer')
const glyph = sequencer.querySelector('.countdown-glyph')
const startBtn = document.querySelector('.start')
const startingPoint = document.querySelector('.starting-point')

//'Unlocks' the sidebar on mouse enter

const sidebarUnlocker = () => {
    document.getElementById('sidebar')
  .addEventListener('mouseenter', translator, { once: true }) //Unlocks the sidebar
}



//Starting the app
startBtn.addEventListener('click', () => {
  startingPoint.style.display = 'block'
  startBtn.style.display = 'none'
  // Gives the browser a split second to render the 'block'
  // change before firing the heavy logic
  document.getElementById('btn1').focus()
  setTimeout(() => {
    startBootSequence()
  }, 100)
})

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

initCursor() //'Predator' aiming cursor
initTheme() //Visual theme switcher
sidebarUnlocker()
initSidebarVisibility() //Toggle sidebar visibility
initStealthMode() //Mute sounds
initRebootSequence() //Browser reloader
initPasswordStrength() //Pass strength
initPasswordStrengthUpdate() //Updates pass strength
initCubeListeners() //Triggers cube listeners
initQRDropZone('#decrypter_input') //Allows dropping the QR code directly
initDecrypterScanner() //Decrypt scanner initialization
arrowKeyNavigator() //Arrow key trigger
initQRController() //Initialize QR controller
terminalActions() //Copy,paste,purge
cryptoProcessors() //Crypto processing



