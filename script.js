// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => io.observe(el));
}

// Header border on scroll
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.style.borderBottomColor = window.scrollY > 30
    ? 'rgba(199,212,222,0.28)'
    : 'rgba(199,212,222,0.14)';
});

// Diccionario A-Z
const dictionaryShell = document.querySelector('.dictionary-shell');
if (dictionaryShell) {
  const panels = Array.from(document.querySelectorAll('.dict-panel'));
  const buttons = Array.from(document.querySelectorAll('.alpha-btn'));
  const searchInput = document.getElementById('dictionarySearch');
  const countLabel = document.getElementById('dictionaryCount');
  let activeLetter = 'A';

  function updateDictionary() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    let visibleTerms = 0;
    let visibleLetters = 0;

    panels.forEach(panel => {
      const letter = panel.dataset.letter;
      const rows = Array.from(panel.querySelectorAll('tbody tr'));
      let panelHasVisibleRows = false;

      rows.forEach(row => {
        const match = term === '' || row.innerText.toLowerCase().includes(term);
        row.style.display = match ? '' : 'none';
        if (match) {
          panelHasVisibleRows = true;
          visibleTerms++;
        }
      });

      let showPanel;
      if (term !== '') {
        showPanel = panelHasVisibleRows;
      } else if (activeLetter === 'todos') {
        showPanel = true;
      } else {
        showPanel = letter === activeLetter;
      }

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

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      activeLetter = button.dataset.letter;
      if (searchInput) searchInput.value = '';
      updateDictionary();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', updateDictionary);
  }

  updateDictionary();

}

