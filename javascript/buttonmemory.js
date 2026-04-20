const BUTTON_MEMORY_KEY = 'aftertherain_previous_character_url';

function setPreviousCharacterUrl(url) {
    try {
        sessionStorage.setItem(BUTTON_MEMORY_KEY, url);
    } catch (e) {
        console.warn('Impossibile salvare l\'URL precedente in sessionStorage', e);
    }
}

function getPreviousCharacterUrl() {
    try {
        return sessionStorage.getItem(BUTTON_MEMORY_KEY);
    } catch (e) {
        console.warn('Impossibile leggere l\'URL precedente da sessionStorage', e);
        return null;
    }
}

if (typeof window !== 'undefined') {
    window.setPreviousCharacterUrl = setPreviousCharacterUrl;
    window.getPreviousCharacterUrl = getPreviousCharacterUrl;
}
