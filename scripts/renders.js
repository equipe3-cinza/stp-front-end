import { API_BASE_URL } from "./api.js";
import { getUserTemplate, getHospitalTemplate, getPacienteTemplate } from './templates.js';


export async function renderTable(tableId, apiUrl, rowTemplate) {
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

export async function renderUsers() {    
    await renderTable('usersTableBody', `${API_BASE_URL}/user`, getUserTemplate);
}

export async function renderHospitais() {
    await renderTable('hospitaisTableBody', `${API_BASE_URL}/unidade`, getHospitalTemplate);

}

export async function renderPacientes() {
    await renderTable('pacientesTableBody', `${API_BASE_URL}/paciente`, getPacienteTemplate);
}

