import {  loadEnderecoById } from './loaders.js';
import { showToast } from './notifications.js';
import { salvarEndereco,saveData,fetchData, API_BASE_URL } from './api.js';



export function setupForm(form, apiUrl, renderCallback) {
    resetForm(form);
    console.log("setupForm ");
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (form.id === 'userForm') {
            const password = form.querySelector('#password').value;
            const password2 = form.querySelector('#password2').value;
            
            if (password !== password2) {
                showToast('As senhas não coincidem. Por favor, digite novamente.', 'error');
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
                if (!data.endereco){
                    data.endereco= "";
                }
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

            }
            const btnEndereco = form.querySelector('#btnEndereco');
            if (btnEndereco && data.endereco) {
                btnEndereco.onclick = () => {
                    window.location.href = `endereco.html?enderecoId=${data.endereco}`;
                };
            }
            const editId = form.dataset.editId;
            
            try {
                const url = editId ? `${apiUrl}/${editId}` : apiUrl;
                const method = editId ? 'PUT' : 'POST';
                
                const savedData = await saveData(url, method, data);
                await renderCallback();
                resetForm(form);
                if (savedData.endereco) {
                    if (confirm('Deseja editar o endereço?')) {
                        window.location.href = `endereco.html?enderecoId=${savedData.endereco}`;
                    }
                }
            } catch (error) {
                console.error('Error saving:', error);
                showToast('Erro ao salvar dados: ' + error.message, 'error');
            }
        });
    }

export function resetForm(form) {
        form.reset();
        form.dataset.editId = '';
    
        
        const multiSelects = form.querySelectorAll('select[multiple]');
        multiSelects.forEach(select => {
            Array.from(select.options).forEach(option => {
                option.selected = false;
            });
        });
        const btnEndereco = form.querySelector('#btnEndereco');
        if (btnEndereco) {
            btnEndereco.style.visibility = 'hidden';
        }
       
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Cadastrar';
        }
    }
    

export function getFormData(form) {
    const formData = new FormData(form);
    return Object.fromEntries(formData.entries());
}

export async function populateFormData(form, data) {
    for (const [key, value] of Object.entries(data)) {
        const input = form.querySelector(`[name="${key}"]`);
        if (!input) continue;
        
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

export async function editData(url) {
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

            const buttonEndereco = form.querySelector('#btnEndereco');
            if (buttonEndereco) {
                buttonEndereco.style.visibility = 'visible';
                buttonEndereco.onclick = () => {
                    window.location.href = `endereco.html?enderecoId=${data.endereco}`;
                };
            }

    } catch (error) {
        console.error('Error editing:', error);
    }
}



export function setupEnderecoForm() {
    const enderecoForm = document.getElementById('enderecoForm');
    if (!enderecoForm) return;

    const params = new URLSearchParams(window.location.search);
    const enderecoId = params.get('enderecoId');
    
    if (enderecoId) {
        loadEnderecoById(enderecoId);
    }

    enderecoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const enderecoData = getEnderecoFormData();
        try {
            await salvarEndereco(enderecoData);
            if (window.opener) {
                const parentForm = window.opener.document.querySelector('form');
                if (parentForm) {
                    resetForm(parentForm);
                }
            }
            window.opener?.document.querySelector('form')?.reset();
            
            setTimeout(() => window.history.back(), 1000);
        } catch (error) {
            console.error('Error saving address:', error);
            showToast('Erro ao salvar endereço', 'error');        }
    });
}

function getEnderecoFormData() {
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
