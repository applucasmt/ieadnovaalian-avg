// ============================================================
// IEAD NOVA ALIANÇA - SCROLL REVEAL
// Animações de entrada ao rolar a página (SEM parallax no hero)
// ============================================================

(function() {
    // ============================================================
    // SELECTORES DOS ELEMENTOS A ANIMAR
    // ============================================================
    const REVEAL_SELECTORS = [
        '#avisos-container > *',
        '#upcoming-events-container > *',
        '#all-events-container > *',
        '#ministerios-container > *',
        '#talentos-container > *',
        '#albums-container > *',
        '#instagram-section',
        'footer'
    ];

    // ============================================================
    // OBSERVER - Detecta quando elementos entram na tela
    // ============================================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05
    });

    // ============================================================
    // APLICAR AOS ELEMENTOS
    // ============================================================
    const applyReveal = () => {
        const elements = document.querySelectorAll(REVEAL_SELECTORS.join(','));
        elements.forEach((el, index) => {
            if (el.classList.contains('reveal')) return;
            el.classList.add('reveal');
            const delay = (index % 5) + 1;
            el.classList.add('delay-' + delay);
            observer.observe(el);
        });
    };

    // Executa quando o DOM estiver pronto
    if (document.readyState === 'complete') {
        applyReveal();
    } else {
        window.addEventListener('load', applyReveal);
    }

    // ============================================================
    // REAPLICAR QUANDO O CONTEÚDO FOR RE-RENDERIZADO
    // ============================================================
    let reapplyTimeout = null;
    const reapplyReveal = () => {
        clearTimeout(reapplyTimeout);
        reapplyTimeout = setTimeout(applyReveal, 300);
    };

    const containers = [
        'avisos-container',
        'upcoming-events-container',
        'all-events-container',
        'ministerios-container',
        'talentos-container',
        'albums-container'
    ];

    const observeContainers = () => {
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const mo = new MutationObserver(reapplyReveal);
            mo.observe(el, { childList: true });
        });
    };

    if (document.readyState === 'complete') {
        observeContainers();
    } else {
        window.addEventListener('load', observeContainers);
    }

    // ============================================================
    // SCROLL SUAVE PARA LINKS INTERNOS
    // ============================================================
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href === '#' || href === '') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // ============================================================
    // LOG DE INICIALIZAÇÃO
    // ============================================================
    console.log('✨ scroll-reveal.js carregado (sem parallax no hero)');
})();
