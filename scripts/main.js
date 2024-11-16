const API_BASE_URL = 'http://localhost:3000';

async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    }

async function saveData(url, method, data) {
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
}

async function deleteData(url) {
    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error deleting:', error);
        throw error;
    }
}

async function renderTable(tableId, apiUrl, rowTemplate) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;

    try {
        const data = await fetchData(apiUrl);
        tableBody.innerHTML = data.map(rowTemplate).join('');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function getUserTemplate(user) {
    return `
        <tr>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${user.perfil}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editData('${API_BASE_URL}/users/${user.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteData('${API_BASE_URL}/users/${user.id}')">Excluir</button>
            </td>
        </tr>
    `;
}

function getHospitalTemplate(hospital) {
    return `
        <tr>
            <td>${hospital.nome}</td>
            <td>${hospital.endereco}</td>
            <td>${hospital.telefone}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editData('${API_BASE_URL}/hospitals/${hospital.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteData('${API_BASE_URL}/hospitals/${hospital.id}')">Excluir</button>
            </td>
        </tr>
    `;
}

function getPacienteTemplate(paciente) {
    return `
        <tr>
            <td data-label="Nome">${paciente.nome}</td>
            <td data-label="Data Nascimento">${new Date(paciente.dataNascimento).toLocaleDateString()}</td>
            <td data-label="CPF">${paciente.cpf}</td>
            <td data-label="Telefone">${paciente.telefone}</td>
            <td data-label="Ações" class="action-buttons">
                <button class="btn-edit" onclick="editData('${API_BASE_URL}/patients/${paciente.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteData('${API_BASE_URL}/patients/${paciente.id}')">Excluir</button>
            </td>
        </tr>
    `;
}
function setupForm(form, apiUrl, renderCallback) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
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
            if (input) input.value = value;
        }

        form.dataset.editId = data.id;
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.textContent = 'Atualizar';
    } catch (error) {
        console.error('Error editing:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    
    //await loadComponent('components/footer', 'footer-container');
    
    const hospitalForm = document.getElementById('hospitalForm');
    const pacienteForm = document.getElementById('pacienteForm');
    const userForm = document.getElementById('userForm');

    if (pacienteForm) {
        setupForm(pacienteForm, `${API_BASE_URL}/patients`, renderPacientes);
    }
    if (hospitalForm) {
        setupForm(hospitalForm, `${API_BASE_URL}/hospitals`, renderHospitais);
    }
    if (userForm) {
        setupForm(userForm, `${API_BASE_URL}/users`, renderUsers);
    }

    async function renderUsers() {
        await renderTable('usersTableBody', `${API_BASE_URL}/users`, getUserTemplate);
    }

    async function renderHospitais() {
        await renderTable('hospitaisTableBody', `${API_BASE_URL}/hospitals`, getHospitalTemplate);
    }

    async function renderPacientes() {
        await renderTable('pacientesTableBody', `${API_BASE_URL}/patients`, getPacienteTemplate);
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
        const userData = await fetchData(`${API_BASE_URL}/users`);
        const user = userData.find(u => u.email === usuario && u.senha === senha);
        console.log(user);

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', 'logged-in');
            window.location.href = 'index.html';
        } else {
            alert('Usuário ou senha inválidos');
        }
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login. Verifique suas credenciais.');
    }
}function logout() {
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
