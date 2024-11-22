import { fetchData, API_BASE_URL } from './api.js';
import { showToast } from './notifications.js';

document.addEventListener('DOMContentLoaded', async () => {
    const enderecoForm = document.getElementById('enderecoForm');
    const params = new URLSearchParams(window.location.search);
    const enderecoId = params.get('enderecoId');
    
    if (enderecoId) {
        await loadEnderecoData(enderecoId);
    }

    enderecoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleFormSubmit();
    });
});

async function loadEnderecoData(enderecoId) {
    try {
        const endereco = await fetchData(`${API_BASE_URL}/endereco/${enderecoId}`);
        populateForm(endereco);
    } catch (error) {
        console.error('Error loading address:', error);
        showErrorMessage('Erro ao carregar dados do endereço');
    }
}

function populateForm(endereco) {
    const fields = ['cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = endereco[field] || '';
        }
    });
}

async function handleFormSubmit() {
    try {
        const enderecoData = getFormData();
        const savedEndereco = await salvarEndereco(enderecoData);
                
        const btnEndereco = document.querySelector('#btnEndereco');
        if (btnEndereco) {
            btnEndereco.style.visibility = 'hidden';
        }
        
        setTimeout(() => {
            window.history.back();
        }, 1500);
    } catch (error) {
        console.error('Error saving address:', error);
        showErrorMessage('Erro ao salvar endereço');
    }
}

function getFormData() {
    const fields = ['cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado'];
    const formData = {};
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            formData[field] = element.value;
        }
    });
    return formData;
}

async function salvarEndereco(enderecoData) {
    console.log("Salvando endereço: ",enderecoData);
    const token = localStorage.getItem('token');
    const enderecoId = new URLSearchParams(window.location.search).get('enderecoId');
    const method = enderecoId ? 'PUT' : 'POST';
    enderecoData.pais ='Brasil';
    const response = await fetch(`${API_BASE_URL}/endereco/${enderecoId || ''}`, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(enderecoData)
    });

    if (response.status === 401) {
        handleUnauthorized();
        return;
    }

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    showToast('Endereço salvo com sucesso!');
    return response.json();
}

function handleUnauthorized() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function showSuccessMessage(message) {
    // Implement your success message UI
    showToast(message);
}

function showErrorMessage(message) {
    // Implement your error message UI
    showToast(message);
}

