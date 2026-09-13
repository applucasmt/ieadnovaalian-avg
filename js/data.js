// ============================================================
// IEAD NOVA ALIANÇA - SISTEMA DE DADOS E CACHE
// ============================================================

// ============================================================
// FETCH COM CACHE (localStorage)
// ============================================================
window.fetchWithCache = async (url, key, force) => {
    force = force || false;
    const cached = localStorage.getItem(key);
    
    // Se não forçar e tiver cache válido, retorna
    if (!force && cached) {
        try {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < window.CONFIG.cacheTime) {
                return data.content;
            }
        } catch(e) {}
    }
    
    // Busca do servidor
    try {
        const response = await fetch(url + '&cacheBust=' + Date.now());
        if (!response.ok) throw new Error('Network error');
        const content = await response.json();
        
        // Salva no cache
        try {
            localStorage.setItem(key, JSON.stringify({
                timestamp: Date.now(),
                content: content
            }));
        } catch(e) {}
        
        return content;
    } catch (error) {
        console.error('Erro fetch ' + key + ':', error);
        // Fallback: retorna cache antigo mesmo expirado
        if (cached) {
            try { return JSON.parse(cached).content; } catch(e) { return []; }
        }
        return [];
    }
};

// ============================================================
// APLICAR CONFIG (LOGO + HERO + POSIÇÃO DO TEXTO)
// ============================================================
window.applyConfigImages = (config) => {
    console.log('🎨 applyConfigImages:', config);
    
    if (!config) {
        console.warn('⚠️ Config vazia');
        return;
    }
    
    // ============================================================
    // 1. LOGO (header + footer + favicon)
    // ============================================================
    if (config.logoUrl && typeof config.logoUrl === 'string' && config.logoUrl.trim()) {
        const logoUrl = config.logoUrl.trim();
        const logoHeader = document.getElementById('site-logo');
        const logoFooter = document.getElementById('footer-logo');
        
        if (logoHeader) logoHeader.src = logoUrl;
        if (logoFooter) logoFooter.src = logoUrl;
        
        // Favicon dinâmico
        const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
        faviconLinks.forEach(link => link.href = logoUrl);
    }
    
    // ============================================================
    // 2. HERO (foto de fundo da home)
    // ============================================================
    if (config.heroUrl && typeof config.heroUrl === 'string' && config.heroUrl.trim()) {
        const heroUrl = config.heroUrl.trim();
        const hero = document.getElementById('site-hero');
        
        if (hero) {
            hero.src = heroUrl;
            hero.setAttribute('data-hero-url', heroUrl);
        }
    }
    
    // ============================================================
    // 3. POSIÇÃO DO TEXTO DO HERO
    // ============================================================
    const heroContent = document.getElementById('hero-content');
    if (heroContent) {
        // Remove todas as classes de posição
        heroContent.classList.remove('pos-left', 'pos-center', 'pos-right', 'pos-custom');
        
        const position = config.heroPosition || 'center';
        const align = config.heroAlign || 'center';
        const posX = parseFloat(config.heroPosX) || 50;
        const posY = parseFloat(config.heroPosY) || 50;
        
        if (position === 'custom') {
            heroContent.classList.add('pos-custom');
            heroContent.style.setProperty('--hero-x', posX + '%');
            heroContent.style.setProperty('--hero-y', posY + '%');
            heroContent.style.setProperty('--hero-align', align);
        } else {
            heroContent.classList.add('pos-' + position);
            heroContent.style.removeProperty('--hero-x');
            heroContent.style.removeProperty('--hero-y');
            heroContent.style.removeProperty('--hero-align');
        }
    }
};

// ============================================================
// CARREGAR TODOS OS DADOS DO SITE
// ============================================================
window.loadData = async () => {
    // ============================================================
    // 1. RENDERIZA PRIMEIRO COM CACHE (rápido)
    // ============================================================
    const cachedKeys = [
        'cache_eventos_v2',
        'cache_avisos_v2',
        'cache_ministerios_v2',
        'cache_albuns_v2',
        'cache_talentos_v2',
        'cache_pastor_v2',
        'cache_config_v2'
    ];
    
    const cachedData = cachedKeys.map(key => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved).content : [];
        } catch(e) { return []; }
    });
    
    // Renderiza com dados em cache
    if (typeof window.renderComponents === 'function') {
        window.renderComponents.apply(null, cachedData);
    }
    
    // ============================================================
    // 2. BUSCA DADOS FRESCOS DO SERVIDOR
    // ============================================================
    try {
        const results = await Promise.all([
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=eventos', 'cache_eventos_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=avisos', 'cache_avisos_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=ministerios', 'cache_ministerios_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=albuns', 'cache_albuns_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=talentos', 'cache_talentos_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=pastor', 'cache_pastor_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=config', 'cache_config_v2', true) // SEMPRE fresco
        ]);
        
        // Renderiza com dados novos
        if (typeof window.renderComponents === 'function') {
            window.renderComponents.apply(null, results);
        }
    } catch (e) {
        console.log('Usando versão em cache devido a erro:', e);
    }
};

// ============================================================
// RENDERIZAR TODOS OS COMPONENTES DA PÁGINA
// ============================================================
window.renderComponents = (events, avisos, ministerios, albums, talentos, pastor, config) => {
    const containers = {
        avisos: document.getElementById('avisos-container'),
        upcoming: document.getElementById('upcoming-events-container'),
        allEvents: document.getElementById('all-events-container'),
        ministerios: document.getElementById('ministerios-container'),
        talentos: document.getElementById('talentos-container'),
        albums: document.getElementById('albums-container')
    };
    
    // ============================================================
    // 1. APLICA CONFIG PRIMEIRO (logo + hero + posição)
    // ============================================================
    if (config && config.length > 0 && config[0]) {
        window.applyConfigImages(config[0]);
    }
    
    // ============================================================
    // 2. FOTO DO PASTOR
    // ============================================================
    if (pastor && pastor.length > 0 && pastor[0].capa) {
        const pastorContainer = document.getElementById('pastor-img-container');
        if (pastorContainer) {
            pastorContainer.innerHTML = '<img src="' + window.optimizeImage(pastor[0].capa, 200) + '" loading="lazy" decoding="async" alt="Pastor" class="w-full h-full object-cover">';
        }
    }
    
    // ============================================================
    // 3. EVENTOS (normalizar + slider + cards)
    // ============================================================
    if (events && events.length) {
        const normalizedEvents = events.map((e, i) => {
            const getVal = (keys) => {
                for(var k=0; k<keys.length; k++) {
                    const key = keys[k];
                    if(e[key]) return e[key];
                    const foundKey = Object.keys(e).find(oky => oky.toLowerCase().indexOf(key.toLowerCase()) !== -1);
                    if(foundKey) return e[foundKey];
                }
                return null;
            };

            return {
                _id: i,
                name: getVal(['name', 'nome', 'titulo', 'tema', 'evento']) || 'Evento sem nome',
                date: getVal(['date', 'data', 'inicio', 'comeco']) || new Date().toISOString(),
                endDate: getVal(['endDate', 'datafim', 'fim', 'termino']) || null,
                description: getVal(['description', 'descricao', 'desc', 'detalhes', 'sobre']) || '',
                coverUrl: getVal(['coverUrl', 'cover', 'capa', 'imagem', 'banner', 'flyer', 'foto', 'cartaz']) || ''
            };
        });
        
        window.globalEvents = normalizedEvents;
        
        // Inicializa slider de marketing
        if (typeof window.initMarketingSlider === 'function') {
            window.initMarketingSlider(window.globalEvents);
        }
    }
    
    // ============================================================
    // 4. AVISOS
    // ============================================================
    if (avisos && avisos.length && containers.avisos) {
        containers.avisos.innerHTML = avisos
            .filter(a => a.texto)
            .map(a => window.createCard(a, 'aviso'))
            .join('');
    }
    
    // ============================================================
    // 5. EVENTOS FUTUROS (upcoming + all)
    // ============================================================
    if (window.globalEvents && window.globalEvents.length) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sorted = window.globalEvents.sort((a, b) => window.parseDate(a.date) - window.parseDate(b.date));
        
        const future = sorted.filter(e => {
            const eventDay = window.parseDate(e.date);
            eventDay.setHours(0, 0, 0, 0);
            return eventDay >= today;
        });
        
        // Próximos 3 eventos
        if (containers.upcoming) {
            containers.upcoming.innerHTML = future
                .slice(0, 3)
                .map(e => window.createCard(e, 'evento'))
                .join('');
        }
        
        // Todos os eventos (página agenda)
        if (containers.allEvents) {
            containers.allEvents.innerHTML = future.length > 0
                ? future.map(e => window.createCard(e, 'evento')).join('')
                : '<div class="col-span-full text-center text-gray-400 py-10">Nenhum evento agendado.</div>';
        }
    }
    
    // ============================================================
    // 6. MINISTÉRIOS
    // ============================================================
    if (ministerios && ministerios.length && containers.ministerios) {
        containers.ministerios.innerHTML = ministerios
            .map(m => window.createCard(m, 'ministerio'))
            .join('');
    }
    
    // ============================================================
    // 7. TALENTOS
    // ============================================================
    if (talentos && talentos.length && containers.talentos) {
        containers.talentos.innerHTML = talentos
            .map(t => window.createCard(t, 'talento'))
            .join('');
    }
    
    // ============================================================
    // 8. ÁLBUNS
    // ============================================================
    if (albums && albums.length && containers.albums) {
        containers.albums.innerHTML = albums
            .map(a => window.createCard(a, 'album'))
            .join('');
    }
};

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('📦 data.js carregado');
