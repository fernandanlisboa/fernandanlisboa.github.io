/**
 * Timeline com card inline (sem modal)
 */
const experienceData = {
  senai: {
    title: 'SENAI CIMATEC',
    period: 'Ago/2021 - Dez/2023',
    role: 'Pesquisadora Graduanda',          
    location: 'Salvador, BA, Brasil',    
    description: `<ul>
            <li>Treinamento de LLMs com foco em NLP, aplicando estudos de viés e justiça para detecção de toxicidade.</li>
            <li>Implementação de modelos com práticas de MLOps e automação de pós-processamento.</li>
            <li>Gestão de projetos com metodologias ágeis e implementação do GitFlow.</li>
        </ul>`,
    skills: ['Data Visualization', 'ML', 'Data Science']
  },
  fraunhofer: {
    title: 'FRAUNHOFER IPT',
    period: 'Fev/2024 - Jan/2025',
    role: 'Estudante Assistente',
    location: 'Aachen, Alemanha',
    description: `
    <ul>
        <li>Desenvolvimento de pipelines de treinamento e otimização de modelos de Deep Learning.</li>
        <li>Implementação de algoritmos de Machine Learning para análise e engenharia de dados de sensores.</li>
        <li>Construção de sistemas automatizados baseados em inferência causal para auxílio na tomada de decisões.</li>
    </ul>
    `,
    skills: ['Industry 4.0', 'Deep Learning', 'Otimização']
  },
  ford: {
    title: 'FORD MOTOR COMPANY',
    period: 'Jun/2025 - Presente',
    role: 'Pesquisadora IEL IA Especialista',
    location: 'Camaçari, BA, Brasil',
    description: `
    <ul>
        <li>Implementação de soluções baseadas em IA, incluindo um agente RAG para chatbot utilizando LLMs e LangChain.</li>
        <li>Definição e orquestração de pipelines CI/CD para garantir a entrega contínua das aplicações.</li>
        <li>Gerenciamento de Infraestrutura como Código (IaC) e PaC no GCP através de Terraform.</li>
        <li>Planejamento e validação de algoritmos e arquiteturas, garantindo escalabilidade e robustez.</li>
    </ul>
    `,
    skills: ['Agentes IA', 'LangChain', 'GCP', 'Terraform']
  }
};

let currentItem = null;
let globalOff = null;

function buildCardHTML(data) {
  const skills = (data.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('');
  return `
    <div class="card-header">
      <h3 class="company-title">${data.title}</h3>
      <span class="role">${data.role ?? ''}</span>
    </div>
    ${data.location ? `<p class="location">${data.location}</p>` : ''}
    <p class="experience-period">${data.period}</p>
    <div class="experience-description">${data.description}</div>
    <div class="experience-skills">${skills}</div>
  `;
}

/* Medidas sempre relativas à .timeline para conectar perfeitamente */
function getRects(container) {
  const timeline = container.querySelector('.timeline');
  const base = timeline.querySelector('.timeline-base');
  const tRect = timeline.getBoundingClientRect();
  const bRect = base.getBoundingClientRect();
  return { timeline, tRect, bRect };
}

/* Faz a linha vertical encostar na linha horizontal de base */
function setLineHeightToBaseline(item) {
  const container = item.closest('#experience .container');
  const { tRect, bRect } = getRects(container);
  const dot = item.querySelector('.timeline-dot');
  const line = item.querySelector('.timeline-line');

  const dRect = dot.getBoundingClientRect();
  const dotBottomY = dRect.bottom - tRect.top; /* posição do bottom do círculo relativa à timeline */
  const baseY = bRect.top - tRect.top;         /* Y da baseline relativa à timeline */

  const target = Math.max(16, Math.round(baseY - dotBottomY + 1)); /* +1 para evitar gap por arredondamento */
  line.style.height = `${target}px`;
}

function resetLineHeight(item) {
  const line = item.querySelector('.timeline-line');
  if (!item.classList.contains('active')) line.style.height = ''; // volta ao CSS
}

/* Posiciona o CARD como painel à direita (não “ao lado do ponto”) */
function positionRightPanel(card, container) {
  const { tRect } = getRects(container);
  const cRect = container.getBoundingClientRect();

  // alinha o topo do card ao topo visual da timeline
  const top = Math.max(0, (tRect.top - cRect.top));
  card.style.top = `${top}px`;
  card.style.left = 'auto';
  // right já está no CSS
}

function openCardFor(item) {
  const key = item?.dataset.company;
  const data = experienceData[key];
  if (!data) return;

  const container = item.closest('#experience .container');
  const card = document.getElementById('experienceCard');

  // ativa estado e ajusta linha
  document.querySelectorAll('#experience .timeline-item.active').forEach(i => i.classList.remove('active'));
  item.classList.add('active');
  setLineHeightToBaseline(item);

  // conteúdo do card
  card.innerHTML = buildCardHTML(data);
  card.hidden = false;

  // posicionar como painel à direita
  positionRightPanel(card, container);

  // listeners globais para fechar ao clicar fora/ESC e recalcular em resize/scroll
  removeGlobalHandlers();
  const clickOutside = (e) => {
    if (!card.contains(e.target) && !item.contains(e.target)) closeCard();
  };
  const onResizeOrScroll = () => {
    if (currentItem) {
      setLineHeightToBaseline(currentItem);
      positionRightPanel(card, container);
    }
  };
  const onEsc = (e) => { if (e.key === 'Escape') closeCard(); };

  document.addEventListener('click', clickOutside);
  window.addEventListener('resize', onResizeOrScroll);
  window.addEventListener('scroll', onResizeOrScroll, true);
  document.addEventListener('keydown', onEsc);

  globalOff = () => {
    document.removeEventListener('click', clickOutside);
    window.removeEventListener('resize', onResizeOrScroll);
    window.removeEventListener('scroll', onResizeOrScroll, true);
    document.removeEventListener('keydown', onEsc);
  };

  currentItem = item;
}

function closeCard() {
  const card = document.getElementById('experienceCard');
  if (!card) return;
  card.hidden = true;
  card.innerHTML = '';
  document.querySelectorAll('#experience .timeline-item.active').forEach(i => i.classList.remove('active'));
  removeGlobalHandlers();
  currentItem = null;
}

function removeGlobalHandlers() {
  if (globalOff) globalOff();
  globalOff = null;
}

export function initExperience() {
  const bind = () => {
    const items = document.querySelectorAll('#experience .timeline-item');
    const container = document.querySelector('#experience .container');
    if (!container || !items.length) return false;

    items.forEach(item => {
      const dot = item.querySelector('.timeline-dot');

      // Crescer a linha até a baseline no hover/focus
      dot.addEventListener('mouseenter', () => requestAnimationFrame(() => setLineHeightToBaseline(item)));
      dot.addEventListener('mouseleave', () => resetLineHeight(item));
      dot.addEventListener('focus', () => setLineHeightToBaseline(item));
      dot.addEventListener('blur', () => resetLineHeight(item));

      // Abrir/fechar painel à direita
      dot.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (currentItem === item) {
          closeCard();
        } else {
          openCardFor(item);
        }
      });
    });

    // Recalcula altura das linhas ativas ao redimensionar
    window.addEventListener('resize', () => {
      if (currentItem) setLineHeightToBaseline(currentItem);
    });

    return true;
  };

  if (bind()) return;

  // Caso a seção seja carregada depois via loader
  const onLoaded = (e) => {
    if (e.detail?.elementId === 'experience-content') {
      bind();
      document.removeEventListener('componentLoaded', onLoaded);
    }
  };
  document.addEventListener('componentLoaded', onLoaded);

  // Reage à mudança de rota: fecha o card quando sair; ao entrar, mantém tudo ok
  document.addEventListener('route:changed', (e) => {
    const hash = e.detail?.hash;
    if (hash !== '#experience') {
      // fecha se estiver aberto (usa closeCard do escopo do módulo)
      try { closeCard(); } catch {}
    } else {
      // ao voltar para experience, nenhuma ação necessária;
      // altura das linhas será recalculada no hover/click
    }
  });
}

export default { initExperience };