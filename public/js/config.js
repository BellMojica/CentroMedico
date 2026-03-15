/**
 * URL base del API (Render).
 */
window.API_BASE_URL = 'https://centromedico-g6p3.onrender.com/api';

/**
 * Base path de la app (para GitHub Pages: /repo-name/; para Express: /).
 */
(function() {
    var path = window.location.pathname;
    if (path === '/' || path === '/dashboard' || path.startsWith('/dashboard/')) {
        window.APP_BASE = '/';
    } else {
        var parts = path.split('/').filter(Boolean);
        window.APP_BASE = parts.length ? '/' + parts[0] + '/' : '/';
    }
})();