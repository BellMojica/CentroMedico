const API_URL = window.API_BASE_URL|| '/api';

function safeParseJson(response) {
    return response.text().then(function (text) {
        const trimmed = text.trim();
        if (trimmed.startsWith('<')) {
            throw new Error('No se pudo conectar con el servidor. La API no está disponible en este entorno (ej. GitHub Pages). Ejecuta el backend en local o configura la URL del API.');
        }
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Respuesta del servidor no válida.');
        }
    });
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    const remember = document.getElementById('remember').checked;
    
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await safeParseJson(response);
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }
        
        if (remember) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
        } else {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('refreshToken', data.refreshToken);
            sessionStorage.setItem('user', JSON.stringify(data.user));
        }
        
        window.location.href = '/dashboard';
        
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.add('show');
    }
});

const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (token) {
    window.location.href = '/dashboard';
}
