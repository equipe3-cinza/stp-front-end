
import { fetchData, saveData, deleteData , API_BASE_URL} from './api.js';
import { login, logout, checkAuth } from './auth.js';
import { editData, setupForm, setupEnderecoForm, resetForm ,} from './forms.js';
import { renderTable, renderUsers, renderHospitais, renderPacientes } from './renders.js';
import { getUserTemplate, getHospitalTemplate, getPacienteTemplate } from './templates.js'
import { loadEnderecoData, loadEnderecoById, loadMedicamentos, loadMedicos } from './loaders.js';

function refreshView(url) {
    if (url.includes('/user/')) {
        return renderUsers();
    } else if (url.includes('/unidade/')) {
        return renderHospitais();
    } else if (url.includes('/paciente/')) {
        return renderPacientes();
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    
    await loadComponent('components/header', 'header-container');
    const currentPage = window.location.pathname.split('/').pop();
    const menuItems = document.querySelectorAll('nav a');
    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });


    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
        const userNameElement = document.getElementById('user-name');
        const userRoleElement = document.getElementById('user-role');
        
        if (userNameElement) userNameElement.textContent = `Usuario: ${userData.login}`;
        if (userRoleElement) userRoleElement.textContent = `Permissão: ${userData.roles.join(', ')}`;
    }

    setupEnderecoForm();

    const hospitalForm = document.getElementById('hospitalForm');
    const pacienteForm = document.getElementById('pacienteForm');
    const userForm = document.getElementById('userForm');
    const enderecoForm = document.getElementById('enderecoForm');

    const forms = [hospitalForm, pacienteForm, userForm].filter(form => form);
    forms.forEach(form => {
        form.reset();
        form.querySelector('button[type="reset"]').addEventListener('click', (e) => {
            e.preventDefault();
            form.reset();
            const multiSelects = form.querySelectorAll('select[multiple]');
            multiSelects.forEach(select => {
                Array.from(select.options).forEach(option => option.selected = false);
            });
            const enderecoBtn = form.querySelector('#btnEndereco');
            if (enderecoBtn) {
                enderecoBtn.style.visibility = 'hidden';
            }
            const btnSalvar = form.querySelector('#btnSalvar');
            if(btnSalvar)
                btnSalvar.textContent = "Cadastrar"
        });
    });

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

window.logout = logout;
window.editData = editData;
window.deleteData = deleteData;
window.getHospitalTemplate = getHospitalTemplate;