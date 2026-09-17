// ============================================================
// IEAD NOVA ALIANÇA - INICIALIZAÇÃO E NAVEGAÇÃO
// ============================================================

window.switchPage = (pageId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const pages = document.querySelectorAll('.page-content');
    const mobileMenu = document.getElementById('mobile-menu');

    pages.forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('animate-fade-in');
    });

    const target = document.getElementById(pageId + '-page');
    if (target) {
        target.classList.remove('hidden');
        void target.offsetWidth;
        target.classList.add('animate-fade-in');
    }

    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active-nav', l.dataset.page === pageId);
    });

    if (mobileMenu) mobileMenu.classList.add('hidden');

    // ✅ Ações por página
    if (pageId === 'aovivo' && typeof window.checkLive === 'function') {
        window.checkLive();
    }

    if (pageId === 'radio' && typeof window.renderRadioPage === 'function') {
        console.log('📻 Chamando renderRadioPage()');
        window.renderRadioPage();
    }

    if (pageId === 'ebd' && window.ebd && typeof window.ebd.fetchInitialData === 'function') {
        window.ebd.fetchInitialData();
    }
};

const setupNav = () => {
    const links = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) window.switchPage(page);
        });
    });

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
};

const init = () => {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    setupNav();

    if (typeof window.loadData === 'function') {
        window.loadData();
    }

    if (typeof window.initAutoRefresh === 'function') {
        window.initAutoRefresh();
    }

    window.switchPage('igreja');

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

    console.log('✅ Site inicializado com sucesso');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('🚀 app.js carregado');
