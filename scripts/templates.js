import { API_BASE_URL } from "./api.js";

export function getUserTemplate(user) {
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

export function getHospitalTemplate(hospital) {
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

export function getPacienteTemplate(paciente) {
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