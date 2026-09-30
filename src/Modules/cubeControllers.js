import { sfx } from './soundControl.js'

export const clickOnSide = side => {
  const cube = document.getElementById('cube')
  if (!cube) return
  const activeSide = cube.dataset.side

  // --- RESET PREVIOUS SIDE ---
  // This cleans up the face you are LEAVING so it's ready for next time
  const oldFace = document.querySelector(`.cube-face-${activeSide}`)
  if (oldFace) {
    const elementsToReset = oldFace.querySelectorAll(
      '.cube-line, .laser-scan, label, input, textarea, button, .cube-headline, img'
    )
    elementsToReset.forEach(el => {
      el.removeAttribute('style') // Nukes the Anime.js inline styles
      //Resets box headline to 30px
      if (el.classList.contains('cube-headline')) {
        el.style.fontSize = '30px'
      }
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
        .add(
          {
            targets: targetFace.querySelectorAll('.cube-line, img, strong'),

            opacity: [0, 1],

            clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],

            translateX: [-6, 0],
            translateY: [-8, 0],

            color: ['#00ffea', '#00ff00'],

            easing: 'easeOutExpo',
            duration: 800,
            delay: anime.stagger(100),

            begin: function (anim) {
              anim.animatables.forEach((el, index) => {
                const target = el.target
                const elementDelay = index * 100

                // Alien/transmission state
                target.style.fontFamily = 'yautja'
                target.style.fontWeight = '700'
                target.style.textShadow = '0 0 4px #00ffea, 0 0 12px #00ffea'

                // Resolve into readable text
                setTimeout(() => {
                  target.style.fontFamily = 'IBM Plex Mono'
                  // target.style.fontWeight = 'bold'
                  target.style.textShadow = 'none'
                }, elementDelay + 240)
              })
            },

            keyframes: [
              {
                opacity: 1,
                translateX: 0,
                duration: 100
              },
              {
                opacity: 0.25,
                translateX: -4,
                duration: 60
              },
              {
                opacity: 1,
                translateX: 3,
                duration: 60
              },
              {
                opacity: 0.5,
                translateX: -2,
                duration: 40
              },
              {
                opacity: 1,
                translateX: 0,
                duration: 180
              }
            ]
          },
          '-=1000'
        )
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
