gsap.registerPlugin(ScrollTrigger);

// Custom Smooth Scrolling Engine via Lenis
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 0.8,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Preloader & Boot Sequence
window.addEventListener('load', () => {
    const loaderLine = document.querySelector('.loader-line');
    loaderLine.style.width = '100%';
    
    setTimeout(() => {
        gsap.to('#preloader', {
            yPercent: -100,
            duration: 1.2,
            ease: "power4.inOut",
            onComplete: initCinematicAnimations
        });
    }, 800);
});

function initCinematicAnimations() {
    // Elegant Hero Title Parallax
    gsap.to('.hero-bg', {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    gsap.to('.hero-title', {
        y: 150, 
        opacity: 0,
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1
        }
    });

    // Subtitle staggered reveal
    gsap.to('.hero-subtitle', {
        y: 0, opacity: 1, duration: 1.5, delay: 0.2, ease: "power3.out"
    });

    // Content Fade-ups
    const fadeUps = document.querySelectorAll('.fade-up');
    fadeUps.forEach(elem => {
        gsap.from(elem, {
            y: 80,
            opacity: 0,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Slow organic parallax for images
    const timelineImages = document.querySelectorAll('.img-wrapper img');
    timelineImages.forEach(img => {
        gsap.fromTo(img, 
            { yPercent: -10, scale: 1.15 },
            { yPercent: 10, scale: 1.15, ease: "none",
              scrollTrigger: { 
                  trigger: img.parentElement, 
                  start: "top bottom", 
                  end: "bottom top", 
                  scrub: true 
              }
            }
        );
    });
}
