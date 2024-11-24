export function showToast(message, type = 'success') {
    const TOAST_ICONS = {
        success: '✓ Sucesso!',
        error: '⚠ Erro:',
        warning: '⚡ Atenção:',
        info: 'ℹ Info:'
    };
    
    const ANIMATION_DELAY = 100;
    const DISPLAY_DURATION = 5000;
    const REMOVAL_DELAY = 300;

    function createToastElement(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <strong>${TOAST_ICONS[type]}</strong>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        return toast;
    }

    function animateToast(toast) {
        setTimeout(() => toast.classList.add('show'), ANIMATION_DELAY);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), REMOVAL_DELAY);
        }, DISPLAY_DURATION);
    }

    const toast = createToastElement(message, type);
    document.body.appendChild(toast);
    animateToast(toast);
}