const API_URL = window.API_BASE_URL || '/api';
let currentSection = 'pacientes';

function safeParseJson(response) {
    return response.text().then(function (text) {
        const trimmed = text.trim();
        if (trimmed.startsWith('<')) {
            throw new Error('No se pudo conectar con el servidor. La API no está disponible.');
        }
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Respuesta del servidor no válida.');
        }
    });
}

const getAuthHeader = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const authFetch = async (url, options = {}) => {
    const headers = { ...getAuthHeader(), ...options.headers };
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        logout();
        throw new Error('Sesión expirada');
    }
    
    return response;
};

const isAuthenticated = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = (window.APP_BASE || '/') === '/' ? '/' : (window.APP_BASE || '/') + 'login.html';
};

const getUser = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const loadUserInfo = () => {
    const user = getUser();
    if (user) {
        document.getElementById('user-name').textContent = user.username || 'Usuario';
    }
};

if (!isAuthenticated()) {
    window.location.href = (window.APP_BASE || '/') === '/' ? '/' : (window.APP_BASE || '/') + 'login.html';
}

const sections = {
    pacientes: {
        title: 'Pacientes',
        endpoint: '/pacientes',
        fields: [
            { name: 'dni', label: 'DNI', type: 'text' },
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'apellido', label: 'Apellido', type: 'text', required: true },
            { name: 'fechaNacimiento', label: 'Fecha de Nacimiento', type: 'date', required: true },
            { name: 'domicilio', label: 'Domicilio', type: 'text', required: true },
            { name: 'idPais', label: 'País', type: 'text', placeholder: 'ARG' },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'observacion', label: 'Observación', type: 'textarea' }
        ],
        columns: ['ID', 'DNI', 'Nombre', 'Apellido', 'Fecha Nac.', 'Email', 'Teléfono', 'Acciones']
    },
    medicos: {
        title: 'Médicos',
        endpoint: '/medicos',
        fields: [
            { name: 'numeroCarnet', label: 'Número de Carnet', type: 'text', required: true },
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'apellido', label: 'Apellido', type: 'text', required: true }
        ],
        columns: ['ID', 'Carnet', 'Nombre', 'Apellido', 'Acciones']
    },
    turnos: {
        title: 'Turnos',
        endpoint: '/turnos',
        fields: [
            { name: 'fechaTurno', label: 'Fecha y Hora', type: 'datetime-local', required: true },
            { name: 'estado', label: 'Estado', type: 'select', options: [
                { value: '1', label: 'Pendiente' },
                { value: '2', label: 'Confirmado' },
                { value: '3', label: 'Atendido' },
                { value: '4', label: 'Cancelado' }
            ]},
            { name: 'observacion', label: 'Observación', type: 'textarea' }
        ],
        columns: ['ID', 'Fecha', 'Estado', 'Observación', 'Acciones']
    },
    historias: {
        title: 'Historias',
        endpoint: '/historias',
        fields: [
            { name: 'fechaHistoria', label: 'Fecha', type: 'datetime-local', required: true },
            { name: 'observacion', label: 'Observación', type: 'textarea', required: true }
        ],
        columns: ['ID', 'Fecha', 'Observación', 'Acciones']
    },
    especialidades: {
        title: 'Especialidades',
        endpoint: '/especialidades',
        fields: [
            { name: 'especialidad', label: 'Especialidad', type: 'text', required: true }
        ],
        columns: ['ID', 'Especialidad', 'Acciones']
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadSection('pacientes');
    loadUserInfo();

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            loadSection(section);
        });
    });

    document.getElementById('btn-add').addEventListener('click', () => openModal('create'));
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });

    document.getElementById('search').addEventListener('input', (e) => {
        filterTable(e.target.value);
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            logout();
        }
    });

    document.getElementById('btn-refresh').addEventListener('click', () => {
        const btn = document.getElementById('btn-refresh');
        btn.classList.add('spinning');
        const config = sections[currentSection];
        renderTable(config);
        setTimeout(() => btn.classList.remove('spinning'), 1000);
    });
});

function loadSection(section) {
    currentSection = section;
    const config = sections[section];
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    
    document.getElementById('page-title').textContent = config.title;
    renderTable(config);
}

function renderTable(config) {
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');
    
    thead.innerHTML = `<tr>${config.columns.map(col => `<th>${col}</th>`).join('')}</tr>`;
    tbody.innerHTML = '<tr><td colspan="100%" class="empty-state"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';
    
    fetch(`${API_URL}${config.endpoint}`)
        .then(res => safeParseJson(res))
        .then(data => {
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="100%" class="empty-state"><i class="fas fa-inbox"></i><br>No hay datos</td></tr>`;
                return;
            }
            tbody.innerHTML = data.map(item => renderRow(item, config)).join('');
        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="100%" class="empty-state">Error al cargar datos</td></tr>`;
            console.error(err);
        });
}

function renderRow(item, config) {
    const cells = [];
    
    switch(currentSection) {
        case 'pacientes':
            cells.push(item.idPaciente, item.dni || '-', item.nombre, item.apellido, 
                      item.fechaNacimiento ? new Date(item.fechaNacimiento).toLocaleDateString() : '-',
                      item.email, item.telefono || '-');
            break;
        case 'medicos':
            cells.push(item.idMedico, item.numeroCarnet, item.nombre, item.apellido);
            break;
        case 'turnos':
            cells.push(item.idTurno, item.fechaTurno ? new Date(item.fechaTurno).toLocaleString() : '-',
                      item.estadoDescripcion || item.estado || '-', item.observacion || '-');
            break;
        case 'historias':
            cells.push(item.idHistoria, item.fechaHistoria ? new Date(item.fechaHistoria).toLocaleString() : '-',
                      (item.observacion || '').substring(0, 50) + ((item.observacion || '').length > 50 ? '...' : ''));
            break;
        case 'especialidades':
            cells.push(item.idEspecialidad, item.especialidad);
            break;
    }
    
    const id = item[`id${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}`] || item.id;
    
    return `<tr data-id="${id}">
        ${cells.map(cell => `<td>${cell}</td>`).join('')}
        <td>
            <button class="btn btn-edit" onclick="editItem(${id})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger" onclick="deleteItem(${id})"><i class="fas fa-trash"></i></button>
        </td>
    </tr>`;
}

function filterTable(query) {
    const rows = document.querySelectorAll('#table-body tr');
    query = query.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

function openModal(mode, id = null) {
    const config = sections[currentSection];
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('data-form');
    
    console.log('openModal - mode:', mode, 'id:', id, 'endpoint:', config.endpoint);
    
    title.textContent = mode === 'create' ? `Agregar ${config.title.slice(0, -1)}` : `Editar ${config.title.slice(0, -1)}`;
    
    const iconMap = {
        dni: 'fa-id-card',
        nombre: 'fa-user',
        apellido: 'fa-user',
        fechaNacimiento: 'fa-calendar-alt',
        domicilio: 'fa-home',
        idPais: 'fa-globe',
        telefono: 'fa-phone',
        email: 'fa-envelope',
        observacion: 'fa-comment',
        numeroCarnet: 'fa-id-card',
        fechaTurno: 'fa-calendar',
        estado: 'fa-check-circle',
        especialidad: 'fa-stethoscope',
        fechaHistoria: 'fa-calendar'
    };
    
    let formHTML = config.fields.map(field => {
        const icon = iconMap[field.name] || 'fa-edit';
        if (field.type === 'select') {
            return `<div class="form-group">
                <label><i class="fas ${icon}"></i> ${field.label}${field.required ? ' <span class="required-mark">*</span>' : ''}</label>
                <select name="${field.name}" ${field.required ? 'required' : ''}>
                    <option value="">Seleccionar...</option>
                    ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                </select>
            </div>`;
        }
        if (field.type === 'textarea') {
            return `<div class="form-group">
                <label><i class="fas ${icon}"></i> ${field.label}${field.required ? ' <span class="required-mark">*</span>' : ''}</label>
                <textarea name="${field.name}" rows="3" ${field.required ? 'required' : ''} placeholder="Ingrese ${field.label.toLowerCase()}..."></textarea>
            </div>`;
        }
        const placeholder = field.type === 'date' || field.type === 'datetime-local' ? '' : `placeholder="Ingrese ${field.label.toLowerCase()}..."`;
        return `<div class="form-group">
            <label><i class="fas ${icon}"></i> ${field.label}${field.required ? ' <span class="required-mark">*</span>' : ''}</label>
            <input type="${field.type}" name="${field.name}" ${field.required ? 'required' : ''} ${placeholder}>
        </div>`;
    }).join('');
    
    const iconBtn = mode === 'create' ? 'fa-plus' : 'fa-save';
    const btnClass = mode === 'create' ? 'btn-primary' : 'btn-success';
    formHTML += `<div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()"><i class="fas fa-times"></i> Cancelar</button>
        <button type="submit" class="btn ${btnClass}"><i class="fas ${iconBtn}"></i> ${mode === 'create' ? 'Crear' : 'Actualizar'}</button>
    </div>`;
    
    form.innerHTML = formHTML;
    form.dataset.mode = mode;
    form.dataset.id = id || '';
    
    modal.classList.add('show');
    
    if (mode === 'edit' && id) {
        setTimeout(() => loadDataForEdit(id, config), 100);
    }
    
    form.addEventListener('submit', handleSubmit);
}

function loadDataForEdit(id, config) {
    fetch(`${API_URL}${config.endpoint}/${id}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Error HTTP: ' + res.status);
            }
            return safeParseJson(res);
        })
        .then(data => {
            if (!data || data.error) {
                throw new Error(data?.error || 'No se pudieron cargar los datos');
            }
            console.log('Datos cargados:', data);
            config.fields.forEach(field => {
                const input = document.querySelector(`[name="${field.name}"]`);
                if (!input) return;
                
                const value = data[field.name];
                if (value !== undefined && value !== null) {
                    if (field.type === 'datetime-local') {
                        input.value = new Date(value).toISOString().slice(0, 16);
                    } else if (field.type === 'date') {
                        input.value = value.split('T')[0];
                    } else {
                        input.value = value;
                    }
                }
            });
        })
        .catch(err => {
            console.error('Error al cargar datos:', err);
        });
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
    document.getElementById('data-form').reset();
}

async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    const config = sections[currentSection];
    
    Object.keys(data).forEach(key => {
        if (data[key] === '') delete data[key];
    });
    
    try {
        const options = {
            method: mode === 'create' ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' }
        };
        
        const url = mode === 'create' 
            ? `${API_URL}${config.endpoint}`
            : `${API_URL}${config.endpoint}/${id}`;
        
        if (mode === 'create') {
            options.body = JSON.stringify(data);
        } else {
            options.body = JSON.stringify(data);
        }
        
        await fetch(url, options);
        closeModal();
        renderTable(config);
    } catch (err) {
        alert('Error al guardar: ' + err.message);
    }
}

async function deleteItem(id) {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    const config = sections[currentSection];
    
    try {
        await fetch(`${API_URL}${config.endpoint}/${id}`, { method: 'DELETE' });
        renderTable(config);
    } catch (err) {
        alert('Error al eliminar: ' + err.message);
    }
}

function editItem(id) {
    console.log('Editando ID:', id);
    openModal('edit', id);
}

