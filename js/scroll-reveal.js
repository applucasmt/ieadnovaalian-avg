// ============================================================
// IEAD NOVA ALIANÇA - SCROLL REVEAL (Animações ao rolar)
// ============================================================

(function() {
    // ============================================================
    // CONFIGURAÇÃO - Quais elementos animar
    // ============================================================
    const REVEAL_SELECTORS = [
        '#avisos-container > *',           // Cards de aviso
        '#upcoming-events-container > *',  // Cards de eventos
        '#all-events-container > *',       // Cards da agenda
        '#ministerios-container > *',      // Cards de ministérios
        '#talentos-container > *',         // Cards de talentos
        '#albums-container > *',           // Cards de galeria
        '.glass-panel',                    // Painéis de vidro em geral
        '#instagram-section',              // Seção do Instagram
        'section h2',                      // Títulos de seção
        'footer',                          // Footer
    ];

    // ============================================================
    // OBSERVER - Detecta quando o elemento entra na viewport
    // ============================================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Ativa 50px antes de aparecer
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Para de observar depois de animar (evita reanimação)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // ============================================================
    // APLICAR AOS ELEMENTOS
    // ============================================================
    const applyReveal = () => {
        const elements = document.querySelectorAll(REVEAL_SELECTORS.join(','));
        
        elements.forEach((el, index) => {
            // Se já tem a classe, pula
            if (el.classList.contains('reveal')) return;
            
            // Adiciona classe de animação
            el.classList.add('reveal');
            
            // Adiciona delay em cascata (para os primeiros 5 elementos)
            const delay = (index % 5) + 1;
            if (delay <= 5) {
                el.classList.add('delay-' + delay);
            }
            
            // Registra no observer
            observer.observe(el);
        });
    };

    // ============================================================
    // EXECUTA QUANDO O DOM ESTIVER PRONTO
    // ============================================================
    if (document.readyState === 'complete') {
        applyReveal();
    } else {
        window.addEventListener('load', applyReveal);
    }

    // ============================================================
    // REAPLICAR QUANDO O CONTEÚDO FOR RE-RENDERIZADO
    // (o site carrega dados assíncronamente, então precisa reaplicar)
    // ============================================================
    let reapplyTimeout = null;
    const reapplyReveal = () => {
        clearTimeout(reapplyTimeout);
        reapplyTimeout = setTimeout(applyReveal, 300);
    };

    // Observa mudanças no DOM dos containers
    const observeContainers = () => {
        const containers = [
            'avisos-container',
            'upcoming-events-container',
            'all-events-container',
            'ministerios-container',
            'talentos-container',
            'albums-container'
        ];

        containers.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            
            const mutationObserver = new MutationObserver(reapplyReveal);
            mutationObserver.observe(el, { childList: true });
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
    // EFEITO PARALLAX SUAVE NO HERO (opcional)
    // ============================================================
    const heroImg = document.getElementById('site-hero');
    if (heroImg) {
        let ticking = false;
        const heroSection = document.querySelector('.hero-section');
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const heroHeight = heroSection ? heroSection.offsetHeight : 0;
                    
                    // Só aplica enquanto o hero estiver visível
                    if (scrolled < heroHeight && window.innerWidth > 768) {
                        // Parallax sutil (move 0.15x da rolagem)
                        heroImg.style.transform = `translateY(${scrolled * 0.15}px)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    console.log('✨ scroll-reveal.js carregado');
})();
