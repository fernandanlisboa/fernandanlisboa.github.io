
/**
 * Marca o link ativo do menu conforme a seção visível no viewport
 */

export function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  
  if (!sections.length || !navLinks.length) return;

  // Remove todos os ativos e marca o link
  function setActiveLink(hash) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Atualiza URL sem scroll
    if (hash && history.replaceState) {
      history.replaceState(null, '', hash);
    }
  }

  // Observer: detecta qual seção está visível
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        setActiveLink(`#${id}`);
      }
    });
  }, {
    root: null,
    rootMargin: '-100px 0px -60% 0px', // Ativa quando seção está no topo
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));

  // Define "about" como ativo por padrão ao carregar
  setTimeout(() => {
    const hash = window.location.hash || '#about';
    setActiveLink(hash);
  }, 100);

  // Atualiza ao clicar em link do menu
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      setActiveLink(hash);
    });
  });
}

export default { initActiveNav };