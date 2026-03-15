/**
 * URL base del API (Render).
 */
window.API_BASE_URL = 'https://centromedico-g6p3.onrender.com/api';

/**
 * Base path de la app (para GitHub Pages: /CentroMedico/; para Express: /).
 * Usar getAppBase() para obtener la base (por si este script carga después).
 */
function getAppBase() {
    if (window.APP_BASE !== undefined) return window.APP_BASE;
    var path = window.location.pathname;
    if (path === '/' || path === '/dashboard' || path.startsWith('/dashboard/')) return '/';
    var i = path.indexOf('/', 1);
    if (i > 0) return path.substring(0, i + 1);
    return path && path !== '/' ? (path + '/') : '/';
}
(function() {
    window.getAppBase = getAppBase;
    window.APP_BASE = getAppBase();
})();