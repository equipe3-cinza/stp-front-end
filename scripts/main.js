const API_BASE_URL = 'http://localhost:3000/api';

async function fetchData(url) {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    }

async function saveData(url, method, data) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
}

async function deleteData(url) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();
            await refreshView(url);
            return result;
        }
        
        await refreshView(url);
        return true;
    } catch (error) {
        console.error('Error deleting:', error);
        throw error;
    }
}

function refreshView(url) {
    if (url.includes('/user/')) {
        return renderUsers();
    } else if (url.includes('/unidade/')) {
        return renderHospitais();
    } else if (url.includes('/paciente/')) {
        return renderPacientes();
    }
}
async function renderTable(tableId, apiUrl, rowTemplate) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;

    try {
        const token = localStorage.getItem('token');
        const data = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        });
        tableBody.innerHTML = data.map(rowTemplate).join('');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function getUserTemplate(user) {
    return `
        <tr>
            <td>${user.login}</td>
            <td>${user.roles}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editData('${API_BASE_URL}/user/${user.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteData('${API_BASE_URL}/user/${user.id}')">Excluir</button>
            </td>
        </tr>
    `;
}

function getHospitalTemplate(hospital) {
    return `
        <tr>
            <td>${hospital.nome}</td>
            <td>${hospital.email}</td>
            <td>${hospital.telefone}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editData('${API_BASE_URL}/unidade/${hospital.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteData('${API_BASE_URL}/unidade/${hospital.id}')">Excluir</button>
            </td>
        </tr>
    `;
}


function getPacienteTemplate(paciente) {
    return `
        <tr>
            <td data-label="Nome">${paciente.nome}</td>
            <td data-label="E-mail">${paciente.email}</td>
            <td data-label="CPF">${paciente.cpf}</td>
            <td data-label="Telefone">${paciente.telefone}</td>
            <td data-label="Ações" class="action-buttons">
                <button class="btn-edit" onclick="editData('${API_BASE_URL}/paciente/${paciente.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteData('${API_BASE_URL}/paciente/${paciente.id}')">Excluir</button>
            </td>
        </tr>
    `;
}

function setupForm(form, apiUrl, renderCallback) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (form.id === 'userForm') {
            const password = form.querySelector('#password').value;
            const password2 = form.querySelector('#password2').value;
            
            if (password !== password2) {
                alert('As senhas não coincidem!');
                return;
            }
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (form.id === 'hospitalForm') {
            const especialidadesSelect = form.querySelector('#especialidades');
            const medicosSelect = form.querySelector('#medicos');
            data.latitude = Number(data.latitude);
            data.longitude = Number(data.longitude);
            data.especialidades = Array.from(especialidadesSelect.selectedOptions).map(option => option.value);
            data.medicos = Array.from(medicosSelect.selectedOptions).map(option => option.value);
            data.temUTI = form.querySelector('#temUTI').checked;
        }
        
        if (form.id === 'userForm') {
            const rolesSelect = form.querySelector('#roles');
            const selectedRoles = Array.from(rolesSelect.selectedOptions).map(option => option.value);
            data.roles = selectedRoles;
        }
        console.log(data);
        const editId = form.dataset.editId;
        
        try {
            const url = editId ? `${apiUrl}/${editId}` : apiUrl;
            const method = editId ? 'PUT' : 'POST';
            
            await saveData(url, method, data);
            await renderCallback();
            resetForm(form);
        } catch (error) {
            console.error('Error saving:', error);
        }
    });
}

function resetForm(form) {
    form.reset();
    form.dataset.editId = '';
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = 'Cadastrar';
}

async function editData(url) {
    try {
        const data = await fetchData(url);
        const form = document.querySelector('form');
        if (!form) return;

        for (const [key, value] of Object.entries(data)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else if (input.tagName === 'SELECT' && input.multiple) {
                    const values = Array.isArray(value) ? value : [value];
                    Array.from(input.options).forEach(option => {
                        option.selected = values.includes(option.value);
                    });
                } else {
                    input.value = value;
                }
            }
        }

        form.dataset.editId = data.id;
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.textContent = 'Atualizar';
    } catch (error) {
        console.error('Error editing:', error);
    }
}
async function renderUsers() {
    await renderTable('usersTableBody', `${API_BASE_URL}/user`, getUserTemplate);
}

async function renderHospitais() {
    await renderTable('hospitaisTableBody', `${API_BASE_URL}/unidade`, getHospitalTemplate);
}

async function renderPacientes() {
    await renderTable('pacientesTableBody', `${API_BASE_URL}/paciente`, getPacienteTemplate);
}

async function loadMedicos() {
    const medicosSelect = document.getElementById('medicos');
    if (!medicosSelect) return;

    try {
        const data = await fetchData(`${API_BASE_URL}/medico`);
        medicosSelect.innerHTML = data.map(medico => 
            `<option value="${medico.id}">${medico.name} - CRM: ${medico.crm}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading medicos:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    
    const hospitalForm = document.getElementById('hospitalForm');
    const pacienteForm = document.getElementById('pacienteForm');
    const userForm = document.getElementById('userForm');

    if (pacienteForm) {
        setupForm(pacienteForm, `${API_BASE_URL}/paciente`, renderPacientes);
    }
    if (hospitalForm) {
        await loadMedicos();
        setupForm(hospitalForm, `${API_BASE_URL}/unidade`, renderHospitais);
    }
    if (userForm) {
        setupForm(userForm, `${API_BASE_URL}/user`, renderUsers);
    }

    if (document.getElementById('usersTableBody')) await renderUsers();
    if (document.getElementById('hospitaisTableBody')) await renderHospitais();
    if (document.getElementById('pacientesTableBody')) await renderPacientes();
});


async function logar() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    if (!usuario || !senha) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: usuario,
                password: senha
            })
        });

        const data = await response.json();
        if (response.ok) {
            // Store user data with roles and id
            localStorage.setItem('user', JSON.stringify({
                id: data.user.id,
                login: data.user.login,
                roles: data.user.roles
            }));
            localStorage.setItem('token', data.token);
            window.location.href = 'index.html';
        } else {
            alert('Usuário ou senha inválidos');
            
        }
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login. Verifique suas credenciais.');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;
    
    if (!token && !currentPage.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}