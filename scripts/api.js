import { renderUsers, renderHospitais, renderPacientes } from './renders.js';
import { showToast } from './notifications.js';

export const API_BASE_URL = 'http://54.221.110.123:3000/api';

const handleUnauthorized = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`
    };
};

const handleResponse = async (response) => {
    if (response.status === 401) {
        handleUnauthorized();
        return;
    }
    
    if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
    }
    
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    
    return response.json();
};

export async function fetchData(url) {
    try {
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

export async function saveData(url, method, data) {
    const token = localStorage.getItem('token');

    if(data.id && method=='PUT')
        delete data.id;

    if (data.prontuario){
        const prontuario = data.prontuario;
        prontuario.paciente = "";
        console.log("saving prontuario ", prontuario);
        if (prontuario.id) {
            data.prontuario = prontuario.id;
            delete prontuario.id;
            console.log("PUT prontuario ", prontuario);
            await saveData(`${API_BASE_URL}/prontuario/${data.prontuario}`, 'PUT', prontuario);       
        } else {  
            delete prontuario.id;          
            console.log("POST prontuario ", prontuario);
            const savedProntuario = await saveData(`${API_BASE_URL}/prontuario`, 'POST', prontuario);
            data.prontuario = savedProntuario.id;
        }
        console.log("prontuario salvo ", data.prontuario);
        if (method === 'PUT'&&  data.id) {
            delete data.id;
        }
    }

    if (method === 'POST' && (url.includes('/paciente') || url.includes('/unidade'))) {
        const endereco = await createEmptyAddress();
        console.log("id novo endereco ", data.endereco);
        data.endereco = endereco.id;
        console.log("id novo endereco ", data.endereco);
    }
        
    try {
        console.log("saving data...", data);
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
        if (response.status === 400) {
            const errorData = await response.json();
            console.error('Error:', errorData);
            throw new Error(errorData.message || response.statusText);
        }

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        console.log("saved data!", data);
        showToast('Dados salvos com sucesso!');
        return response.json();
    } catch (error) {
        console.error('Save error:', error);
        throw error;
    }
}

async function createEmptyAddress() {
    const emptyAddress = {
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        pais: 'Brasil'
    };
    
    try {
        const response = await saveData(`${API_BASE_URL}/endereco`, 'POST', emptyAddress);
        return response;
    } catch (error) {
        console.error('Error creating empty address:', error);
        throw error;
    }
}
export async function deleteData(url) {
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();
            await refreshView(url);
            return result;
        }
        
        await refreshView(url);
        showToast('Dados excluidos com sucesso!');
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

export async function salvarEndereco(enderecoData) {
    const enderecoId = new URLSearchParams(window.location.search).get('enderecoId');
    const method = enderecoId ? 'PUT' : 'POST';
    enderecoData.pais = 'Brasil';
    return saveData(`${API_BASE_URL}/endereco/${enderecoId || ''}`, method, enderecoData);
}
