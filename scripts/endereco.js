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
        showSuccessMessage('Endereço salvo com sucesso!');
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
    const token = localStorage.getItem('token');
    const enderecoId = new URLSearchParams(window.location.search).get('enderecoId');
    const method = enderecoId ? 'PUT' : 'POST';
    
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

    return response.json();
}

function handleUnauthorized() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function showSuccessMessage(message) {
    // Implement your success message UI
    alert(message);
}

function showErrorMessage(message) {
    // Implement your error message UI
    alert(message);
}