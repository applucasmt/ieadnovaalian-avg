// ============================================================
// IEAD NOVA ALIANÇA - SISTEMA DE DADOS E CACHE
// ============================================================

// ============================================================
// FETCH COM CACHE
// ============================================================
window.fetchWithCache = async (url, key, force) => {
    force = force || false;
    const cached = localStorage.getItem(key);
    
    if (!force && cached) {
        try {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < window.CONFIG.cacheTime) {
                return data.content;
            }
        } catch(e) {}
    }
    
    try {
        const response = await fetch(url + '&cacheBust=' + Date.now());
        if (!response.ok) throw new Error('Network error');
        const content = await response.json();
        try {
            localStorage.setItem(key, JSON.stringify({
                timestamp: Date.now(),
                content: content
            }));
        } catch(e) {}
        return content;
    } catch (error) {
        console.error('Erro fetch ' + key + ':', error);
        if (cached) {
            try { return JSON.parse(cached).content; } catch(e) { return []; }
        }
        return [];
    }
};

// ============================================================
// APLICAR CONFIG (LOGO + HERO PC/MOBILE + POSIÇÃO + TEXTOS)
// ============================================================
window.applyConfigImages = (config) => {
    console.log('🎨 applyConfigImages:', config);
    if (!config) return;
    
    // LOGO
    if (config.logoUrl && typeof config.logoUrl === 'string' && config.logoUrl.trim()) {
        const logoUrl = config.logoUrl.trim();
        const logoHeader = document.getElementById('site-logo');
        const logoFooter = document.getElementById('footer-logo');
        if (logoHeader) logoHeader.src = logoUrl;
        if (logoFooter) logoFooter.src = logoUrl;
        
        const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
        faviconLinks.forEach(link => link.href = logoUrl);
    }
    
    // HERO IMAGEM - Detecção de dispositivo
    const isMobile = window.innerWidth <= 768;
    let heroUrlToUse = '';
    
    if (isMobile && config.heroUrlMobile && typeof config.heroUrlMobile === 'string' && config.heroUrlMobile.trim() !== '') {
        heroUrlToUse = config.heroUrlMobile.trim();
        console.log('📱 Usando imagem MOBILE:', heroUrlToUse);
    } else if (config.heroUrl && typeof config.heroUrl === 'string' && config.heroUrl.trim() !== '') {
        heroUrlToUse = config.heroUrl.trim();
        console.log('💻 Usando imagem DESKTOP:', heroUrlToUse);
    }
    
    if (heroUrlToUse) {
        const hero = document.getElementById('site-hero');
        if (hero) {
            hero.src = heroUrlToUse;
            hero.setAttribute('data-hero-url', heroUrlToUse);
        }
    }
    
    // TEXTOS DO HERO
    const badgeEl = document.getElementById('hero-badge');
    const titleEl = document.getElementById('hero-title');
    const descEl = document.getElementById('hero-description');
    
    if (badgeEl && config.heroSubtitle && config.heroSubtitle.trim()) {
        badgeEl.textContent = config.heroSubtitle.trim();
    }
    
    if (titleEl && config.heroTitle && config.heroTitle.trim()) {
        const parts = config.heroTitle.split('\\n');
        if (parts.length > 1) {
            titleEl.innerHTML = parts[0] + '<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">' + parts[1] + '</span>';
        } else {
            titleEl.textContent = config.heroTitle;
        }
    }
    
    if (descEl && config.heroDescription && config.heroDescription.trim()) {
        descEl.textContent = config.heroDescription.trim();
    }
    
    // POSIÇÃO DO HERO
    const heroContent = document.getElementById('hero-content');
    if (heroContent) {
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
// TROCAR IMAGEM AO REDIMENSIONAR (PC ↔ Celular)
// ============================================================
let lastIsMobile = window.innerWidth <= 768;
window.addEventListener('resize', () => {
    const currentIsMobile = window.innerWidth <= 768;
    if (currentIsMobile !== lastIsMobile) {
        lastIsMobile = currentIsMobile;
        try {
            const cached = localStorage.getItem('cache_config_v2');
            if (cached) {
                const data = JSON.parse(cached);
                if (data.content && data.content[0]) {
                    window.applyConfigImages(data.content[0]);
                }
            }
        } catch(e) {}
    }
});

// ============================================================
// CARREGAR DADOS
// ============================================================
window.loadData = async () => {
    const cachedKeys = [
        'cache_eventos_v2', 'cache_avisos_v2', 'cache_ministerios_v2',
        'cache_albuns_v2', 'cache_talentos_v2', 'cache_pastor_v2', 'cache_config_v2'
    ];
    
    const cachedData = cachedKeys.map(key => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved).content : [];
        } catch(e) { return []; }
    });
    
    if (typeof window.renderComponents === 'function') {
        window.renderComponents.apply(null, cachedData);
    }
    
    try {
        const results = await Promise.all([
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=eventos', 'cache_eventos_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=avisos', 'cache_avisos_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=ministerios', 'cache_ministerios_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=albuns', 'cache_albuns_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=talentos', 'cache_talentos_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=pastor', 'cache_pastor_v2', false),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=config', 'cache_config_v2', true)
        ]);
        
        if (typeof window.renderComponents === 'function') {
            window.renderComponents.apply(null, results);
        }
    } catch (e) {
        console.log('Usando versão em cache:', e);
    }
};

// ============================================================
// RENDERIZAR COMPONENTES
// ============================================================
window.renderComponents = (events, avisos, ministerios, albums, talentos, pastor, config) => {
    const containers = {
        upcoming: document.getElementById('upcoming-events-container'),
        allEvents: document.getElementById('all-events-container'),
        ministerios: document.getElementById('ministerios-container'),
        talentos: document.getElementById('talentos-container'),
        albums: document.getElementById('albums-container')
    };
    
    // ============================================================
    // 1. APLICA CONFIG (logo + hero + posição)
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
            pastorContainer.innerHTML = '<img src="' + window.optimizeImage(pastor[0].capa, 200) + '" loading="lazy" alt="Pastor" class="w-full h-full object-cover">';
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
        
        if (typeof window.initMarketingSlider === 'function') {
            window.initMarketingSlider(window.globalEvents);
        }
    }
    
    // ============================================================
    // 4. AVISOS - CARROSSEL (estilo Disney/Netflix)
    // ============================================================
    if (avisos && avisos.length) {
        console.log('📢 Renderizando carrossel de avisos:', avisos.length, 'itens');
        if (typeof window.renderAvisosCarousel === 'function') {
            window.renderAvisosCarousel(avisos);
        } else {
            console.warn('⚠️ renderAvisosCarousel não está definido');
        }
    } else {
        // Sem avisos - esconde o carrossel
        const carousel = document.getElementById('avisos-carousel');
        if (carousel) carousel.classList.add('hidden');
    }
    
    // ============================================================
    // 5. EVENTOS FUTUROS
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
        
        if (containers.upcoming) {
            containers.upcoming.innerHTML = future.slice(0, 3).map(e => window.createCard(e, 'evento')).join('');
        }
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
        containers.ministerios.innerHTML = ministerios.map(m => window.createCard(m, 'ministerio')).join('');
    }
    
    // ============================================================
    // 7. TALENTOS
    // ============================================================
    if (talentos && talentos.length && containers.talentos) {
        containers.talentos.innerHTML = talentos.map(t => window.createCard(t, 'talento')).join('');
    }
    
    // ============================================================
    // 8. ÁLBUNS
    // ============================================================
    if (albums && albums.length && containers.albums) {
        containers.albums.innerHTML = albums.map(a => window.createCard(a, 'album')).join('');
    }
};

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('📦 data.js carregado');
