//Intro boot sequence
const audioP = new Audio('/Sounds/predator-aiming.ogg');

export const startBootSequence =() => {
    audioP.play()
    audioP.currentTime = 0;

    const sequencer = document.getElementById('boot-sequencer');
    const glyph = sequencer.querySelector('.countdown-glyph');
    const sidebarContent = document.querySelector('.menu');
    
    const symbols = "0123456789PREDATOR";
    let currentLength = 5; // Starting with "##:##"

    sidebarContent.style.opacity = "0";

    anime({
        targets: glyph,
        duration: 5000, // Slower 5-second burn
        easing: 'linear',
        update: function(anim) {
            const progress = anim.progress; 
            
            const newLength = Math.ceil(5 * (1 - (progress / 100)));

            // 2. Slow down the flicker (only change symbols every 8 frames)
            if (Math.round(progress * 10) % 8 === 0) {
                let rand = "";
                for (let i = 0; i < newLength; i++) {
                    // Keep the colon logic if we have enough chars
                    if (i === 2 && newLength > 2) rand += "x";
                    else rand += symbols[Math.floor(Math.random() * symbols.length)];
                }
                glyph.innerText = rand;

                // 3. Heavy Flicker: Occasional deep dimming
                const flicker = Math.random();
                if (flicker > 0.8) glyph.style.opacity = "0.1";
                else if (flicker > 0.4) glyph.style.opacity = "1";
                else glyph.style.opacity = "0.7";
                
                // 4. Slight scale "thump" when a character drops
                if (newLength < currentLength) {
                    currentLength = newLength;
                    glyph.style.transform = 'scale(1.1)';
                    setTimeout(() => glyph.style.transform = 'scale(1)', 100);
                }
            }
        },
        complete: () => {
            // Flash and Reveal
            anime({
                targets: sequencer,
                opacity: 0,
                scale: 2, // "Explosion" feel
                duration: 600,
                easing: 'easeInQuart',
                complete: () => {
                    sequencer.remove();
                    anime({
                        targets: sidebarContent,
                        opacity: 1,
                        translateY: [30, 0],
                        duration: 2000
                    });
                }
            });
        }
    });
    //Intro lines animation
anime({
  targets: '.status-text.first-line,.line',
  opacity: [0, 1],
  clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
  translateY: [-10, 0],
  easing: 'easeOutExpo',
  duration: 800,
  delay: anime.stagger(500), // Time between each line appearing
  begin: function(anim) {
  },
  changeComplete: function(el) {

  },
 
  keyframes: [
    {opacity: 1, duration: 100},
    {opacity: 0.5, duration: 100}, 
    {opacity: 1, duration: 100},  
  ]
});

}