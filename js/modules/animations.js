// js/modules/animations.js

// Animação de Fade-in ao Rolar
export function initFadeInObserver() {
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    if (fadeInSections.length === 0) return;

    const fadeInObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    fadeInSections.forEach(section => fadeInObserver.observe(section));
}

// Efeito de Digitação
export function initTypingEffect() {
    const subtitleElement = document.getElementById('subtitle');
    if (!subtitleElement) return;

    const text = subtitleElement.innerText;
    let i = 0;
    subtitleElement.innerHTML = "";
    subtitleElement.style.borderRight = '2px solid white';

    function typing() {
        if (i < text.length) {
            subtitleElement.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, 100);
        } else {
            subtitleElement.style.borderRight = 'none';
        }
    }
    typing();
}
