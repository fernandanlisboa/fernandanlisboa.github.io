// js/main.js

// Importa as funções dos nossos módulos
import { loadComponent } from './modules/loadComponent.js';
import { initExperience } from './modules/experience.js';
import { initActiveNav } from './modules/activeNav.js';

// Mapa de placeholders -> fragmentos
const components = {
  'header-content': 'sections/_header.html',
  'about-content': 'sections/_about.html',
  'experience-content': 'sections/_experience.html',
  'projects-content': 'sections/_projects.html',
  'publications-content': 'sections/_publications.html',
  'footer-placeholder': 'sections/_footer.html'
};

const loaded = new Set();

async function ensureLoaded(id) {
  if (!components[id] || loaded.has(id)) return;
  await loadComponent(id, components[id]);
  loaded.add(id);

  // header -> carrega o menu dentro do header
  if (id === 'header-content') {
    await loadComponent('nav-container', 'sections/_nav.html');
    bindNavClicks(); // vincula cliques do menu após existir
  }

  // inicializações de módulos que dependem da seção
  if (id === 'experience-content') {
    initExperience();
  }
}

// Lazy-load com IntersectionObserver
function setupObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        await ensureLoaded(id);
        io.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '200px 0px 200px 0px', // pré-carrega um pouco antes
    threshold: 0.01
  });

  Object.keys(components).forEach((id) => {
    const el = document.getElementById(id);
    if (el && id !== 'header-content') io.observe(el);
  });

  return io;
}

// Clique no menu: carrega a seção alvo antes de rolar
function bindNavClicks() {
  const nav = document.querySelector('#nav-container .nav');
  if (!nav) return;

  nav.addEventListener('click', async (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    e.preventDefault();
    const hash = link.getAttribute('href'); // ex: #experience
    const anchorId = hash.slice(1);        // experience
    // mapeia anchor -> placeholder
    const map = {
      'about': 'about-content',
      'experience': 'experience-content',
      'projects': 'projects-content',
      'publications': 'publications-content',
      'footer': 'footer-placeholder'
    };
    const placeholderId = map[anchorId];
    if (placeholderId) {
      await ensureLoaded(placeholderId);
      // Atualiza hash e rola até a âncora (já dentro do fragmento)
      history.pushState(null, '', hash);
      const anchor = document.getElementById(anchorId);
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Carrega sempre o header + menu
  await ensureLoaded('header-content');

  // Se abriu com hash, garanta o preload da seção e role
  const initialHash = window.location.hash || "#about";
  if (initialHash) {
    const anchorId = initialHash.slice(1);
    const map = {
      'about': 'about-content',
      'experience': 'experience-content',
      'projects': 'projects-content',
      'publications': 'publications-content',
      'footer': 'footer-placeholder',
    };
    const placeholderId = map[anchorId];
    if (placeholderId) {
      await ensureLoaded(placeholderId);
      // pequeno timeout para garantir DOM inserido
      setTimeout(() => {
        const anchor = document.getElementById(anchorId);
        if (anchor) anchor.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 0);
    }
  }

  // Ativa lazy-load para o restante (scroll normal)
  setupObserver();

  setTimeout(() => {
    initActiveNav();
  }, 500);
});
