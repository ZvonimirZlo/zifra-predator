import { sfx } from './soundControl.js'

export const clickOnSide = side => {
  const cube = document.getElementById('cube')
  if (!cube) return
  const activeSide = cube.dataset.side


// --- RESET PREVIOUS SIDE ---
  // This cleans up the face you are LEAVING so it's ready for next time
  const oldFace = document.querySelector(`.cube-face-${activeSide}`)
  if (oldFace) {
    const elementsToReset = oldFace.querySelectorAll('.cube-line, .laser-scan, label, input, textarea, button')
    elementsToReset.forEach(el => {
      el.removeAttribute('style') // Nukes the Anime.js inline styles
    })
  }


  cube.classList.replace(`show-${activeSide}`, `show-${side}`)
  cube.setAttribute('data-side', side)

  setTimeout(() => {
    const targetFace = document.querySelector(`.cube-face-${side}`)
    const laser = targetFace.querySelector('.laser-scan')
    sfx.beam.volume = 0.5
    sfx.beam.play()
    if (laser) {
      anime
        .timeline({ easing: 'linear' })
        .add({
          targets: laser,
          opacity: [0.5, 1, 0.8, 0],
          top: ['0%', '100%'],
          duration: 1500
        })
        .add(
          {
            targets: targetFace.querySelectorAll(
              'label, input, textarea, button'
            ),
            opacity: [0.5, 1],
            translateY: [10, 0],
            delay: anime.stagger(50),
            duration: 400
          },
          '-=800'
        )
        .add({
          targets: targetFace.querySelectorAll('.cube-line'),
          opacity: [0, 1],
          clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
          translateY: [-10, 0],
          color: ['#00ffea', '#00ff00'],
          easing: 'easeOutExpo',
          duration: 800,
          delay: anime.stagger(100), // Time between each line appearing
          begin: function (anim) {},
          changeComplete: function (el) {},

          keyframes: [
            { opacity: 1, duration: 100 },
            { opacity: 0.5, duration: 100 },
            { opacity: 1, duration: 100 }
          ]
        },'-=1000')
    }
  }, 600)
}

// Wiring up the buttons within the module
export const initCubeListeners = () => {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      clickOnSide(e.target.dataset.side)
      sfx.beep.play()
    })
  })
}
