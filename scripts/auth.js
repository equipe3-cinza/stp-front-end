import { API_BASE_URL } from "./api.js";

export async function login() {
//export async function login(usuario, senha) {

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    if (!usuario || !senha) {
        showToast('Por favor, preencha todos os campos');
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
            showToast('Usuário ou senha inválidos');
            
        }
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showToast('Erro ao fazer login. Verifique suas credenciais.');
    }
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

export function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;
    
    if (!token && !currentPage.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

window.login = login;
