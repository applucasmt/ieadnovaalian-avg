// ============================================================
// IEAD NOVA ALIANÇA - INICIALIZAÇÃO E NAVEGAÇÃO
// ============================================================

// ============================================================
// NAVEGAÇÃO ENTRE PÁGINAS
// ============================================================
window.switchPage = (pageId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const pages = document.querySelectorAll('.page-content');
    const mobileMenu = document.getElementById('mobile-menu');

    // Esconde todas as páginas
    pages.forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('animate-fade-in');
    });

    // Mostra a página alvo
    const target = document.getElementById(pageId + '-page');
    if (target) {
        target.classList.remove('hidden');
        void target.offsetWidth; // Force reflow
        target.classList.add('animate-fade-in');
    }

    // Atualiza os links ativos
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active-nav', l.dataset.page === pageId);
    });

    // Fecha o menu mobile
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }

    // Ações especiais por página
    if (pageId === 'aovivo' && typeof window.checkLive === 'function') {
        window.checkLive();
    }

    if (pageId === 'ebd' && window.ebd && typeof window.ebd.fetchInitialData === 'function') {
        window.ebd.fetchInitialData();
    }
};

// ============================================================
// CONFIGURAR NAVEGAÇÃO (links, botão mobile)
// ============================================================
const setupNav = () => {
    const links = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // Adiciona listener em todos os links
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                window.switchPage(page);
            }
        });
    });

    // Botão do menu mobile
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
};

// ============================================================
// INICIALIZAÇÃO GERAL
// ============================================================
const init = () => {
    // Ano atual no footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Setup da navegação
    setupNav();

    // Carrega os dados (com cache + fetch)
    if (typeof window.loadData === 'function') {
        window.loadData();
    }

    // ✅ NOVO: Inicia o polling automático
    // - Verifica a cada 45s se houve mudanças (via hash no servidor)
    // - Pausa quando a aba está oculta, retoma ao voltar
    // - Escuta "storage" e "BroadcastChannel" para abas do mesmo navegador
    if (typeof window.initAutoRefresh === 'function') {
        window.initAutoRefresh();
    }

    // Abre a página inicial
    window.switchPage('igreja');

    // ============================================================
    // LAZY LOAD DO GOOGLE MAPS (contato)
    // Só carrega quando entra na tela
    // ============================================================
    const setupLazyMaps = () => {
        const contactPage = document.getElementById('contato-page');
        if (!contactPage) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target.querySelector('iframe[data-src]');
                    if (iframe && iframe.dataset.src) {
                        iframe.src = iframe.dataset.src;
                        iframe.removeAttribute('data-src');
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px' });

        observer.observe(contactPage);
    };

    setupLazyMaps();

    // ============================================================
    // AUTO PLAY DO MARKETING (opcional)
    // ============================================================
    // Descomente as linhas abaixo para ativar auto-play do slider
    // if (typeof window.startMarketingAutoPlay === 'function') {
    //     window.startMarketingAutoPlay(6000);
    // }

    console.log('✅ Site inicializado com sucesso');
};

// ============================================================
// EXECUTA QUANDO O DOM ESTIVER PRONTO
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('🚀 app.js carregado');
