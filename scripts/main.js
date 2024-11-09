function loadMenu() {
    fetch("components/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
        })
        .catch(error => console.error("Erro ao carregar o cabeçalho:", error));
}

function loadFooter() {
    fetch("components/footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer-container").innerHTML = data;
    })
    .catch(error => console.error("Erro ao carregar o footer:", error));
}


async function loadPage(route) {
    console.log('routes', route)

    if (route === 'login') {
        document.getElementById("header-container").innerHTML = '';
        document.getElementById("footer-container").innerHTML = '';
    } else {
        loadMenu();
        loadFooter();
    }

    const page = `pages/${route}/${route}.html`;
    const cssFile = `pages/${route}/${route}.css`;
    fetch(page)
        .then(response => response.text())
        .then(data => {
            removeOldCSS();
            loadCSS(cssFile);
            document.getElementById('template-container').innerHTML = data;
            history.pushState({ route }, '', `#/${route}`);

        })
        .catch(error => console.error('Erro ao carregar a página:', error));
}

function loadCSS(cssFile) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssFile;
    link.className = 'dynamic-css'; // Adiciona uma classe para identificar os estilos dinâmicos
    document.head.appendChild(link);
}

// Função para remover os estilos CSS antigos
function removeOldCSS() {
    const oldLinks = document.querySelectorAll('link.dynamic-css');
    oldLinks.forEach(link => link.remove());
}

// Função para carregar o navbar
function loadNavbar() {
    fetch('./../e-commerce/components/navbar/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        });
}

// Função para gerenciar as rotas
function handleRoute() {
    const hash = window.location.hash.substring(2);
    if (hash) {
        loadPage(hash);
    } else {
        loadPage('login'); // Página padrão
    }
}

// Carrega o navbar e a página inicial ou a rota atual
window.onload = function () {
    loadNavbar();
    handleRoute();
};

// Atualiza a página quando a hash da URL muda
window.onhashchange = handleRoute;

// Lida com o evento de navegação do histórico
window.onpopstate = function (event) {
    if (isLogado()) {
        loadPage(event.state.route);
    } else {
        loadPage('login'); // Página padrão
    }
};

function isLogado() {
    const token = localStorage.getItem('token');
    return token ? true : false;
}

function logar() {
    localStorage.setItem('token', 'Bearer tokenMock');
    loadPage('home');
}

function logout() {
    localStorage.removeItem('token');
    loadPage('login');
}
