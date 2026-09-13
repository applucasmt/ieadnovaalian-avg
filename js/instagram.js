// ============================================================
// IEAD NOVA ALIANÇA - WIDGET DO INSTAGRAM (Behold.so)
// ============================================================

// ============================================================
// CARREGAR SCRIPT DO BEHOLD.SO (assíncrono)
// ============================================================
(function() {
    if (window.__bhldScript) return;
    window.__bhldScript = true;
    
    const d = document;
    const s = d.createElement('script');
    s.type = 'module';
    s.src = 'https://w.behold.so/widget.js';
    
    setTimeout(() => {
        d.head.append(s);
    }, 0);
})();

// ============================================================
// CONFIGURAR LINKS DO BEHOLD (abrir direto no Instagram)
// ============================================================
(function() {
    const setupBeholdLinks = () => {
        const widget = document.querySelector('behold-widget');
        if (!widget) return;

        const processLinks = () => {
            try {
                const shadowRoot = widget.shadowRoot;
                if (!shadowRoot) return;
                
                const links = shadowRoot.querySelectorAll('a');
                links.forEach(link => {
                    // Força abrir em nova aba
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                    
                    // Corrige URL se estiver indo para o Behold ao invés do Instagram
                    const href = link.getAttribute('href') || '';
                    if (!href.includes('instagram.com') && href.includes('behold')) {
                        const match = href.match(/\/p\/([^\/\?]+)/) || href.match(/\/reel\/([^\/\?]+)/);
                        if (match) {
                            const type = href.includes('/reel/') ? 'reel' : 'p';
                            link.setAttribute('href', 'https://www.instagram.com/' + type + '/' + match[1] + '/');
                        }
                    }
                });
            } catch (e) {
                // Shadow DOM pode não estar acessível ainda
            }
        };

        // Tenta várias vezes (o Behold renderiza assincronamente)
        processLinks();
        setTimeout(processLinks, 1000);
        setTimeout(processLinks, 3000);
        setTimeout(processLinks, 6000);
        
        // Observer para pegar quando os links forem renderizados
        if (widget.shadowRoot) {
            const observer = new MutationObserver(processLinks);
            observer.observe(widget.shadowRoot, { childList: true, subtree: true });
        }
    };

    if (document.readyState === 'complete') {
        setupBeholdLinks();
    } else {
        window.addEventListener('load', setupBeholdLinks);
    }
    setTimeout(setupBeholdLinks, 2000);
})();

// ============================================================
// LAZY LOAD DO BEHOLD (só carrega quando entra na tela)
// ============================================================
(function() {
    // Se o navegador suportar IntersectionObserver, usa lazy loading
    if (!('IntersectionObserver' in window)) return;
    
    const initLazyLoad = () => {
        const instagramSection = document.getElementById('instagram-section');
        if (!instagramSection) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Quando entra na tela, força o carregamento do widget
                    const widget = entry.target.querySelector('behold-widget');
                    if (widget) {
                        // O Behold já carrega automaticamente, mas podemos forçar visibilidade
                        widget.style.visibility = 'visible';
                    }
                    // Para de observar depois de carregar
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '200px', // Começa a carregar 200px antes de aparecer
            threshold: 0.01
        });
        
        observer.observe(instagramSection);
    };
    
    if (document.readyState === 'complete') {
        initLazyLoad();
    } else {
        window.addEventListener('load', initLazyLoad);
    }
})();

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('📸 instagram.js carregado');
