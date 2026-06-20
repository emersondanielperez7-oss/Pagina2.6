// Usar una función autoejecutable (IIFE) o un módulo evita contaminar el alcance global
(() => {
  'use strict';

  // 1. REVEAL ON SCROLL (Optimizado)
  const initScrollReveal = () => {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observerOptions = { 
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px' // Comienza la animación un poco antes de que entre
    };

    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Libera memoria destruyendo la observación
        }
      });
    }, observerOptions);

    revealEls.forEach(el => io.observe(el));
  };

  // 2. HEADER BORDER (Optimizado para evitar Reflows continuos)
  const initHeaderScroll = () => {
    const header = document.querySelector('header');
    if (!header) return;

    let isScrolled = false;

    window.addEventListener('scroll', () => {
      const shouldScroll = window.scrollY > 30;
      // Solo muta el DOM si el estado real cambia (Evita repaints innecesarios)
      if (shouldScroll !== isScrolled) {
        isScrolled = shouldScroll;
        header.classList.toggle('header-scrolled', isScrolled);
      }
    }, { passive: true }); // 'passive: true' mejora drásticamente el rendimiento de scroll en móviles
  };

  // 3. DICCIONARIO A-Z (Optimizado y Modular)
  const initDictionary = () => {
    const dictionaryShell = document.querySelector('.dictionary-shell');
    if (!dictionaryShell) return;

    const panels = Array.from(document.querySelectorAll('.dict-panel'));
    const buttons = Array.from(document.querySelectorAll('.alpha-btn'));
    const searchInput = document.getElementById('dictionarySearch');
    const countLabel = document.getElementById('dictionaryCount');
    let activeLetter = 'A';

    // Función auxiliar Debounce para no saturar la CPU al escribir
    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      };
    };

    function updateDictionary() {
      const term = (searchInput?.value || '').trim().toLowerCase();
      let visibleTerms = 0;
      let visibleLetters = 0;

      panels.forEach(panel => {
        const letter = panel.dataset.letter;
        // Cacheamos las filas del panel actual
        const rows = panel.querySelectorAll('tbody tr');
        let panelHasVisibleRows = false;

        rows.forEach(row => {
          // Búsqueda más precisa enfocada en los contenedores de conceptos, no en toda la fila
          const conceptEl = row.querySelector('.concept-name, .term-es');
          const searchableText = conceptEl ? conceptEl.textContent : row.textContent;
          
          const match = term === '' || searchableText.toLowerCase().includes(term);
          row.style.display = match ? '' : 'none';

          if (match) {
            panelHasVisibleRows = true;
            visibleTerms++;
          }
        });

        // Lógica booleana simplificada para determinar visibilidad del panel
        const showPanel = term !== '' 
          ? panelHasVisibleRows 
          : (activeLetter === 'todos' || letter === activeLetter);

        panel.style.display = showPanel ? '' : 'none';
        
        if (showPanel && (term === '' || panelHasVisibleRows)) {
          visibleLetters++;
        }
      });

      if (countLabel) {
        const termText = visibleTerms === 1 ? 'término' : 'términos';
        const letterText = visibleLetters === 1 ? 'letra visible' : 'letras visibles';
        countLabel.textContent = `${visibleTerms} ${termText} · ${visibleLetters} ${letterText}`;
      }
    }

    // Manejo de eventos de botones
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const currentActive = document.querySelector('.alpha-btn.active');
        if (currentActive) currentActive.classList.remove('active');
        
        button.classList.add('active');
        activeLetter = button.dataset.letter;
        
        if (searchInput) searchInput.value = '';
        updateDictionary();
      });
    });

    // Escucha el input usando Debounce (espera 150ms después de que el usuario deja de teclear)
    if (searchInput) {
      searchInput.addEventListener('input', debounce(updateDictionary, 150));
    }

    // Inicialización de la vista
    updateDictionary();
  };

  // Orquestación de inicialización cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initHeaderScroll();
    initDictionary();
  });
})();
