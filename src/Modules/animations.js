import {sfx} from './soundControl';
import { showTerminalAlert } from './terminalAlert';



const body = document.body
const overlay = document.getElementById('theme-overlay')
const allBtns = document.querySelectorAll('.sidebar .btn')
const blue = () => document.getElementById('blue');
const green = () => document.getElementById('green');




// export function showTerminalAlert(message) {
//   const alertBox = document.getElementById('terminal-alert');
//   const msgText = document.getElementById('alert-message');
  
//  if (!alertBox || !msgText) return;

//   // 3. Update the text
//   msgText.innerText = message;

//   return anime.timeline({ easing: 'easeOutExpo' })
//     .add({
//       targets: alertBox,
//       left: 20,
//       opacity: [0, 1, 0.5, 1, 0.8, 1],
//       duration: 500
//     })
//     .add({
//       targets: '.alert-scanner',
//       left: ['0%', '100%'],
//       duration: 1000,
//       easing: 'linear'
//     })
//     .add({
//       targets: alertBox,
//       opacity: 0,
//       left: -300,
//       delay: 2000,
//       duration: 500
//     });
// }

//System purge
let currentPulse = 0
const totalButtons = 6
let nukeInterval = null

export function startDecayCountdown () {
  sfx.beep.play()
  const allBtns = Array.from(document.querySelectorAll('.sidebar .btn'))
  const killBtn = document.getElementById('kill-button')
  //Disables the kill button
  killBtn.disabled = true
  killBtn.style.pointerEvents = 'none' // Physical lock
  killBtn.style.filter = 'grayscale(1) brightness(0.5)'

  nukeInterval = setInterval(() => {
    if (currentPulse < totalButtons) {
      sfx.countdown.volume = 0.5
      sfx.countdown.play()
      const activeButtons = allBtns.slice(0, totalButtons - currentPulse)
      const dyingButton = allBtns[totalButtons - 1 - currentPulse]

      // 3. The Global Pulse
      anime({
        targets: activeButtons,
        color: ['#ff0000', '#ff0000'],
        duration: 400,
        easing: 'steps(5)',
        begin: () => {
          allBtns.map(x => {
            x.style.fontFamily = 'yautja'
            x.style.fontSize = '40px'
          })
          activeButtons.forEach(btn => {
            btn.innerText = Math.floor(Math.random() * 9)
          })
        },
        complete: () => {
          // The dying button is officially 'fried'
          dyingButton.innerText = ''
          dyingButton.style.borderColor = '#220000'
          dyingButton.style.boxShadow = 'none'

          // Ensure survivors stay transparent until the NEXT pulse
          activeButtons.forEach(btn => {
            if (btn !== dyingButton) {
              btn.style.color = 'transparent'
            }
          })
        }
      })

      currentPulse++
    } else {
      clearInterval(nukeInterval)
    }
  }, 1000)

  setTimeout(() => {
    window.location.reload()
  }, 6500)
}

export function toggleSidebar () {
  document.getElementById('sidebar').classList.toggle('open')
}

//Gauntlet activator
export const translator = () => {
  const buttons = document.querySelectorAll('.sidebar .btn');
    const blue = document.getElementById('blue');

    if (buttons.length === 0) {
        console.error("Translator Error: No buttons found in sidebar!");
        return;
    }
  const active = document.querySelector('.status')
  const humanLabels = {
    front: 'Encrypter',
    right: 'Decrypter',
    back: 'Manual',
    left: 'About',
    top: 'Top',
    bottom: 'Bottom'
  }
  allBtns.forEach((btn, index) => {
    const side = btn.dataset.side
    const translation = humanLabels[side]

    if (translation) {
      setTimeout(() => {
        btn.innerText = translation
        btn.style.fontFamily = 'IBM Plex Mono'
        btn.style.fontSize = '14px'

        anime({
          targets: btn,
          filter: ['brightness(5)', 'brightness(1)'],
          textShadow: ['0 0 20px red', '1px 1px 2px red'],
          duration: 1000,
          easing: 'easeOutExpo'
        })
      }, index * 100)
    }
    blue.style.boxShadow = '0 0 10px #38B6FF'
    // active.style.color = '#f00000';
  })

  sfx.unlock.play()
}





//Toggle blue or green theme
export function setTheme (theme) {
  const statusMsg = theme === 'green' ? "THERMAL_UPLINK_STABLE" : "VISUAL_SPECTRUM_RESET";
    showTerminalAlert(statusMsg);
  if (theme === 'green') {
    sfx.change.play()
    body.classList.add('green-theme')
    overlay.style.background = 'rgb(255, 255, 0)' // Yellow filter -> Green result
    overlay.style.mixBlendMode = 'multiply'
    green().style.textShadow = '2px 2px 10px #00ff41'
    green().style.boxShadow = '0 0 10px #00ff41'
    blue().style.textShadow = 'none'
    blue().style.boxShadow = 'none'
  } else {
    sfx.change.play()
    body.classList.remove('green-theme')
    blue().style.textShadow = '2px 2px 10px #38B6FF'
    blue().style.boxShadow = '0 0 10px #38B6FF'
    green().style.textShadow = 'none'
    green().style.boxShadow = 'none'
  }
}


