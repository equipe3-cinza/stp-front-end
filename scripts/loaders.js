import { fetchData, API_BASE_URL } from './api.js';

export async function loadMedicos() {
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

export async function loadMedicamentos() {
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

export async function loadEnderecoById(enderecoId) {
    try {
        const data = await fetchData(`${API_BASE_URL}/endereco/${enderecoId}`);
        const addressFields = document.querySelector('.address-fields');
        if (addressFields && data) {
            const cep = addressFields.querySelector('#cep');
            const rua = addressFields.querySelector('#rua');
            const numero = addressFields.querySelector('#numero');
            const complemento = addressFields.querySelector('#complemento');
            const bairro = addressFields.querySelector('#bairro');
            const cidade = addressFields.querySelector('#cidade');
            const estado = addressFields.querySelector('#estado');
            
            if (cep) cep.value = data.cep;
            if (rua) rua.value = data.rua;
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

export async function loadEnderecoData(enderecoId) {
    try {
        const endereco = await fetchData(`${API_BASE_URL}/endereco/${enderecoId}`);
        populateForm(endereco);
    } catch (error) {
        console.error('Error loading address:', error);
        showErrorMessage('Erro ao carregar dados do endereço');
    }
}


function showErrorMessage(message) {
    showToast(message);
}
