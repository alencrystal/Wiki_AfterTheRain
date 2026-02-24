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

      // --- DYNAMIC RESISTANCES/WEAKNESSES/IMMUNITIES ---
      async function updateResistances(types) {
        if (typeof window.computeTypeEffectiveness !== 'function') {
          console.warn('computeTypeEffectiveness non disponibile — assicurati che javascript/weakness.js sia incluso prima di populate.js');
          return;
        }
        try {
          const primary = types && types.length ? types[0] : null;
          if (!primary) return; // nothing to compute
          const secondary = types && types.length > 1 ? types[1] : null;
          const { groups } = await window.computeTypeEffectiveness(primary, secondary);

          // Order and labels for boxes we want to create when non-empty
          const order = [ '4', '2', '0.5', '0.25', '0' ];
          const labels = {
            '4': 'x4',
            '2': 'x2',
            '0.5': 'x½',
            '0.25': 'x¼',
            '0': 'x0'
          };

          const wrapper = document.querySelector('.resistances-wrapper');
          if (!wrapper) return;

          // Clear existing boxes and rebuild only those with items
          wrapper.innerHTML = '';

          order.forEach(key => {
            const list = groups[key] || [];
            if (!list || list.length === 0) return; // skip empty groups

            const box = document.createElement('div');
            box.className = 'resist-box';

            const title = document.createElement('div');
            title.className = 'resist-title';
            title.textContent = labels[key];
            box.appendChild(title);

            const badges = document.createElement('div');
            badges.className = 'resist-badges';

            list.forEach(t => {
              const sp = document.createElement('span');
              // include both class for general styling and the type name for optional color rules
              sp.className = `resist-badge ${String(t).toLowerCase()}`;
              sp.textContent = String(t).toUpperCase();
              badges.appendChild(sp);
            });

            box.appendChild(badges);
            wrapper.appendChild(box);
          });
        } catch (e) {
          console.error('Errore nel calcolo delle effettività dei tipi', e);
        }
      }

      // Avvia l'aggiornamento delle resistenze usando i tipi del personaggio
      updateResistances(char.type || []);

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
