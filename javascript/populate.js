// Script per popolare la pagina con i dati di un personaggio
// Viene eseguito quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  // Legge l'id dalla query string, es. `?id=20`.
  // Se non presente, usa un id di default (modificabile qui).
  const urlId = new URLSearchParams(location.search).get('id');
  // Default changed to 0 as requested
  const defaultId = urlId ? Number(urlId) : 0;

  // Espone una funzione globale `setCharacterById(id)` che carica i dati
  // e aggiorna il DOM. Ritorna una Promise (funzione async).
  window.setCharacterById = async function(id) {
    try {
      // Carica il file JSON con la lista dei personaggi
      const res = await fetch('data/character.json');
      const list = await res.json();

      // Trova il personaggio con l'id richiesto; se non trovato, usa il primo
      const char = list.find(c => Number(c.id) === Number(id)) || list[0];

      // Selettori degli elementi della pagina da aggiornare
      const idEl = document.querySelector('.char-id');
      const nameEl = document.querySelector('.char-name');
      const spriteEl = document.querySelector('.sprite-img');
      const typeBadges = document.querySelector('.type-badges');
      const abilityEl = document.querySelector('.ability-name');
      const descEl = document.querySelector('.description-text');

      // Aggiorna id, nome e sprite
      idEl.textContent = `#${char.id}`;
      nameEl.textContent = char.name.toUpperCase();
      spriteEl.src = `sprite/${char.sprite}.gif`;
      spriteEl.alt = `${char.name} sprite`;

      // Tipi: pulisce il contenuto e crea badge per ogni tipo presente
      typeBadges.innerHTML = '';
      (char.type || []).forEach(t => {
        const s = document.createElement('span');
        // assegna classi per stile (es. `badge water`)
        s.className = `badge ${t.toLowerCase()}`;
        s.textContent = t.toUpperCase();
        typeBadges.appendChild(s);
      });

      // Abilità e descrizione: se non presenti, mostra stringa vuota
      abilityEl.textContent = (char.ability || '');
      descEl.textContent = char.description || '';

      // Mappa le etichette visibili alle chiavi nei dati (HP -> hp, ...)
      const statMap = { HP: 'hp', ATK: 'atk', DEF: 'def', MATK: 'matk', MDEF: 'mdef', SPD: 'spd' };
      // Valore massimo usato per calcolare la larghezza percentuale delle barre
      const MAX_STAT = 20; // modifica se la scala cambia

      // Per ogni riga di stat nella pagina, aggiorna valore numerico e barra
      document.querySelectorAll('.stat-row').forEach(row => {
        const label = row.querySelector('.stat-label').textContent.trim().toUpperCase();
        const key = statMap[label];
        if (!key || !char.stats) return; // se etichetta non mappata o dati mancanti
        const value = char.stats[key];
        if (value == null) return; // se il valore non esiste
        const valEl = row.querySelector('.stat-value');
        const fillEl = row.querySelector('.stat-bar-fill');
        // imposta il numero e la larghezza della barra in percentuale
        valEl.textContent = String(value);
        const pct = Math.round((value / MAX_STAT) * 100);
        fillEl.style.width = pct + '%';
      });

    } catch (e) {
      // In caso di errore (es. file non trovato), logga per debug
      console.error('Errore caricamento character.json', e);
    }
  };

  // Inizializza la pagina con l'id di default (o quello passato in query)
  window.setCharacterById(defaultId);
});
