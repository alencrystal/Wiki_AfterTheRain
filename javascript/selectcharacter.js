// Gestisce i pulsanti PREV/NEXT e chiama setCharacterById(id)
// Limiti: id minimo 0, massimo 20
document.addEventListener('DOMContentLoaded', () => {
  const MIN_ID = 0;
  const MAX_ID = 20;

  // Legge id dalla query string se presente, altrimenti 0
  const urlId = new URLSearchParams(location.search).get('id');
  let currentId = urlId ? Number(urlId) : 0;

  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');

  // Abilita/disabilita i pulsanti se si è ai limiti
  function updateButtons() {
    if (prevBtn) prevBtn.disabled = currentId <= MIN_ID;
    if (nextBtn) nextBtn.disabled = currentId >= MAX_ID;
  }

  // Imposta l'id rispettando i limiti e richiama la funzione globale
  function setId(id) {
    const v = Math.max(MIN_ID, Math.min(MAX_ID, Number(id)));
    currentId = v;

    // Se la funzione è già definita, chiamala; altrimenti aspetta brevemente
    if (typeof window.setCharacterById === 'function') {
      window.setCharacterById(currentId);
    } else {
      const t = setInterval(() => {
        if (typeof window.setCharacterById === 'function') {
          clearInterval(t);
          window.setCharacterById(currentId);
        }
      }, 50);
    }

    // Aggiorna la query string senza ricaricare la pagina
    try {
      const url = new URL(location.href);
      url.searchParams.set('id', String(currentId));
      history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
    } catch (e) {
      // ignore
    }

    updateButtons();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => setId(currentId + 1));
  if (prevBtn) prevBtn.addEventListener('click', () => setId(currentId - 1));

  // Inizializza: aggiorna pulsanti e carica il personaggio corrente
  updateButtons();
  setId(currentId);
});
