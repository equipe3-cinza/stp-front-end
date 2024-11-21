const API_BASE_URL = 'http://localhost:3000/api';

async function fetchData(url) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return;
        }
        
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function saveData(url, method, data) {
    const token = localStorage.getItem('token');

    if (data.prontuario){
        console.log("saving prontuario ", data);
        
        if (data.prontuario.id) {
            const idProntuario= data.prontuario.id;
            console.log("PUT prontuario ", data.prontuario);
            delete data.prontuario.id;
            await saveData(`${API_BASE_URL}/prontuario/${idProntuario}`, 'PUT', data.prontuario);
            data.prontuario = idProntuario;
        } else {
            console.log("POST prontuario ", data);
            saveData(`${API_BASE_URL}/prontuario`, 'POST', data.prontuario);
        }
        console.log("prontuario salvo ", data);
        delete data.id;
    }

    try {
        console.log("prontuario salvo ", data);
        const response = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Save error:', error);
        throw error;
    }
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

async function enderecoPaciente(){
    const form = document.getElementById('pacienteForm');
    const pacienteId = form.dataset.editId;
    try {
        console.log(`Id do paciente= ${pacienteId}`);
        const paciente = await fetchData(`${API_BASE_URL}/paciente/${pacienteId}`);        
        const enderecoId = paciente.endereco;
        if (enderecoId) {
            window.location.href = `endereco.html?enderecoId=${enderecoId}`;
        } else {
            alert('Salve o paciente primeiro antes de cadastrar o endereço');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao buscar dados do paciente');
    }
}

async function enderecoHospital() {
    const form = document.getElementById('hospitalForm');
    const hospitalId = form.dataset.editId;
    try {
        console.log(`Id do paciente= ${hospitalId}`);
        const hospital = await fetchData(`${API_BASE_URL}/unidade/${hospitalId}`);
        const enderecoId = hospital.endereco;
        if (enderecoId) {
            window.location.href = `endereco.html?enderecoId=${enderecoId}`;
        } else {
            alert('Salve o hospital primeiro antes de cadastrar o endereço');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao buscar dados do hospital');
    }
}



function getUserTemplate(user) {
    return `
        <tr>
            <td data-label="Login">${user.login}</td>
            <td data-label="Perfil">${user.roles}</td>
            <td data-label="Ações" class="action-buttons">
                <button class="btn-edit" onclick="editData('${API_BASE_URL}/user/${user.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteData('${API_BASE_URL}/user/${user.id}')">Excluir</button>
            </td>
        </tr>
    `;
}

function getHospitalTemplate(hospital) {
    return `
        <tr>
            <td data-label="Nome">${hospital.nome}</td>
            <td data-label="E-mail">${hospital.email}</td>
            <td data-label="Telefone">${hospital.telefone}</td>
            <td data-label="Ações" class="action-buttons">
                <button class="btn-edit" onclick="editData('${API_BASE_URL}/unidade/${hospital.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteData('${API_BASE_URL}/unidade/${hospital.id}')">Excluir</button>
            </td>
        </tr>
    `;
}

function getPacienteTemplate(paciente) {
    const medicamentos = paciente.prontuario?.medicamentosAtuais?.join(', ') || 'Nenhum medicamento';
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
        
        if (form.id === 'pacienteForm') {
            if (form.dataset.editId) {
                data.id = form.dataset.editId;
            }
            
            data.prontuario = data.prontuario || {};
            const medicamentosSelect = form.querySelector('#medicamentosAtuais');
            const classificacaoSelect = form.querySelector('#classificacao');
            data.prontuario = {
                id: form.querySelector('#prontuarioId').value || null,
                classificacao: classificacaoSelect.value,
                medicamentosAtuais: Array.from(medicamentosSelect.selectedOptions).map(option => option.value)
            };
            delete data.classificacao;
            delete data.medicamentosAtuais;
            delete data.prontuarioId;
            console.log("setupForm ", data);

        }

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

    
    const multiSelects = form.querySelectorAll('select[multiple]');
    multiSelects.forEach(select => {
        Array.from(select.options).forEach(option => {
            option.selected = false;
        });
    });
   
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Cadastrar';
    }
}


async function editData(url) {
    try {
        const data = await fetchData(url);
        
   //     if (data.endereco) {
   //        await loadEnderecoById(data.endereco);
   //     }

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

        if (data.prontuario) {
            const prontuarioData = await fetchData(`${API_BASE_URL}/prontuario/${data.prontuario}`);
            
            const medicamentosSelect = form.querySelector('#medicamentosAtuais');
            const classificacaoSelect = form.querySelector('#classificacao');
            
            if (classificacaoSelect) {
                classificacaoSelect.value = prontuarioData.classificacao;
            }
            const prontuarioIdInput = form.querySelector('#prontuarioId');
            if (prontuarioIdInput) {
                prontuarioIdInput.value = data.prontuario;
            }

            if (medicamentosSelect && prontuarioData.medicamentosAtuais) {
                Array.from(medicamentosSelect.options).forEach(option => {
                    option.selected = false;
                });
                
                prontuarioData.medicamentosAtuais.forEach(medicamentoId => {
                    const option = medicamentosSelect.querySelector(`option[value="${medicamentoId}"]`);
                    if (option) {
                        option.selected = true;
                    }
                });
            }
            console.log("editdata ", data);
        }
        
        if (url.includes('/paciente/')) {
            const submitButton = document.querySelector('#pacienteForm button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Atualizar';
            }
        }

        form.dataset.editId = data.id;
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Atualizar';
        }

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

async function loadMedicamentos() {
    const medicamentosSelect = document.getElementById('medicamentosAtuais');
    if (!medicamentosSelect) return;

    try {
        const data = await fetchData(`${API_BASE_URL}/medicamento`);

        medicamentosSelect.innerHTML = data.map(medicamento => 
            `<option value="${medicamento.id}">${medicamento.nome}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading medicamentos:', error);
    }
}

async function loadEnderecoById(enderecoId) {
    try {
        const data = await fetchData(`${API_BASE_URL}/endereco/${enderecoId}`);
        const addressFields = document.querySelector('.address-fields');
        if (addressFields && data) {
            const cep = addressFields.querySelector('#cep');
            const logradouro = addressFields.querySelector('#logradouro');
            const numero = addressFields.querySelector('#numero');
            const complemento = addressFields.querySelector('#complemento');
            const bairro = addressFields.querySelector('#bairro');
            const cidade = addressFields.querySelector('#cidade');
            const estado = addressFields.querySelector('#estado');
            
            if (cep) cep.value = data.cep;
            if (logradouro) logradouro.value = data.rua;
            if (numero) numero.value = data.numero;
            if (complemento) complemento.value = data.complemento;
            if (bairro) bairro.value = data.bairro;
            if (cidade) cidade.value = data.cidade;
            if (estado) estado.value = data.estado;
        }
    } catch (error) {
        console.error('Error loading address:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    
    const hospitalForm = document.getElementById('hospitalForm');
    const pacienteForm = document.getElementById('pacienteForm');
    const userForm = document.getElementById('userForm');

    if (pacienteForm) {
        await loadMedicamentos();
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

