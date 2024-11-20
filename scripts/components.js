document.addEventListener('DOMContentLoaded', () => {
    loadComponent('components/header', 'header-container').then(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('pacientes')) {
            const pacientesLink = document.querySelector('nav a[href*="pacientes"]');
            if (pacientesLink) {
                pacientesLink.classList.add('active');
            }
        }
        if (currentPath.includes('hospitais')) {
            const hospitaisLink = document.querySelector('nav a[href*="hospitais"]');
            if (hospitaisLink) {
                hospitaisLink.classList.add('active');
            }
        }
        if (currentPath.includes('usuarios')) {
            const usuariosLink = document.querySelector('nav a[href*="usuarios"]');
            if (usuariosLink) {
                usuariosLink.classList.add('active');
            }
        }
        if (currentPath.includes('transferencia')) {
            const loginLink = document.querySelector('nav a[href*="transferencia"]');
            if (loginLink) {
                loginLink.classList.add('active');
            }
        }

    });
    loadComponent('components/footer', 'footer-container');
});

async function loadComponent(component, containerId) {
    try {
        const response = await fetch(`${component}.html`);
        const data = await response.text();
        document.getElementById(containerId).innerHTML = data;
    } catch (error) {
        console.error(`Error loading ${component}:`, error);
    }
}

