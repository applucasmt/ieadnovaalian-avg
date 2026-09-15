// ============================================================
// IEAD NOVA ALIANÇA - SISTEMA DE DADOS E CACHE
// ✅ Cache desligado para conteúdo (Opção C).
// ✅ Config com TTL curto + pré-carregamento de imagem (sem flash).
// ✅ Polling adaptativo por hash (?action=ping) — atualiza o site
//    em qualquer navegador/dispositivo em até 45s.
// ============================================================

// ============================================================
// CHAVES QUE PODEM USAR CACHE
// ============================================================
window.CACHE_ENABLED_KEYS = ['cache_config_v2'];

// ============================================================
// CONFIGURAÇÃO DO POLLING
// ============================================================
window.AUTO_REFRESH_CONFIG = {
    intervalMs: 45000,       // 45s entre verificações
    pingTimeout: 15000,      // timeout do fetch do ping
    enabled: true
};

// ============================================================
// LIMPA TODO O CACHE DA APLICAÇÃO NO LOCALSTORAGE
// ============================================================
window.clearAppCache = () => {
    const keysToRemove = [
        'cache_eventos_v2', 'cache_avisos_v2', 'cache_ministerios_v2',
        'cache_albuns_v2', 'cache_talentos_v2', 'cache_pastor_v2',
        'cache_config_v2',
        'admin_eventos', 'admin_avisos', 'admin_ministerios',
        'admin_albuns', 'admin_talentos', 'admin_pastor', 'admin_config',
        'cache_eventos', 'cache_avisos', 'cache_ministerios',
        'cache_albuns', 'cache_talentos', 'cache_pastor', 'cache_config'
    ];
    keysToRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch(e) {}
    });
    console.log('🧹 clearAppCache: cache da aplicação limpo.');
};

// ============================================================
// FETCH (COM CACHE APENAS PARA CONFIG)
// ============================================================
window.fetchWithCache = async (url, key, force) => {
    force = force || false;
    const cacheAllowed = window.CACHE_ENABLED_KEYS.indexOf(key) !== -1;
    const cached = localStorage.getItem(key);

    if (cacheAllowed && !force && cached) {
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

        if (cacheAllowed) {
            try {
                localStorage.setItem(key, JSON.stringify({
                    timestamp: Date.now(),
                    content: content
                }));
            } catch(e) {}
        }
        return content;
    } catch (error) {
        console.error('Erro fetch ' + key + ':', error);
        if (cacheAllowed && cached) {
            try { return JSON.parse(cached).content; } catch(e) { return []; }
        }
        return [];
    }
};

// ============================================================
// ✅ NOVO: PRÉ-CARREGAR IMAGEM
// Retorna uma Promise que resolve quando a imagem carregou OU
// depois de `timeoutMs` (o que vier primeiro). Se falhar, resolve
// com `null` — nunca rejeita, para não travar o fluxo.
// ============================================================
window.preloadImage = (url, timeoutMs) => {
    timeoutMs = timeoutMs || 4000;
    return new Promise((resolve) => {
        if (!url || typeof url !== 'string' || !url.trim()) {
            resolve(null);
            return;
        }

        let done = false;
        const finish = (result) => {
            if (done) return;
            done = true;
            resolve(result);
        };

        const img = new Image();
        img.onload = () => finish(url);
        img.onerror = () => finish(null);
        img.src = url;

        setTimeout(() => finish(url), timeoutMs); // fallback: não trava
    });
};

// ============================================================
// APLICAR CONFIG (LOGO + HERO PC/MOBILE + POSIÇÃO + TEXTOS)
// ✅ Pré-carrega a imagem do hero antes de aplicar (evita flash).
// ============================================================
window.applyConfigImages = async (config) => {
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
            const currentSrc = hero.getAttribute('src') || '';
            // ✅ Só aplica se for diferente (evita reload desnecessário)
            if (currentSrc !== heroUrlToUse) {
                // ✅ Pré-carrega antes de aplicar (elimina o flash)
                await window.preloadImage(heroUrlToUse, 4000);
                hero.src = heroUrlToUse;
                hero.setAttribute('data-hero-url', heroUrlToUse);
                console.log('🖼️ Hero aplicado após preload:', heroUrlToUse);
            }
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
// ✅ Conteúdo sempre do servidor. Config também forçado.
// ============================================================
window.loadData = async (force) => {
    force = force === true;

    try {
        const results = await Promise.all([
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=eventos', 'cache_eventos_v2', true),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=avisos', 'cache_avisos_v2', true),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=ministerios', 'cache_ministerios_v2', true),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=albuns', 'cache_albuns_v2', true),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=talentos', 'cache_talentos_v2', true),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=pastor', 'cache_pastor_v2', true),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=config', 'cache_config_v2', true)
        ]);

        if (typeof window.renderComponents === 'function') {
            window.renderComponents.apply(null, results);
        }
    } catch (e) {
        console.error('Erro ao carregar dados:', e);
        if (typeof window.renderComponents === 'function') {
            window.renderComponents([], [], [], [], [], [], []);
        }
    }
};

// ============================================================
// RENDERIZAR COMPONENTES
// ============================================================
window.renderComponents = (events, avisos, ministerios, albums, talentos, pastor, config) => {
    events = Array.isArray(events) ? events : [];
    avisos = Array.isArray(avisos) ? avisos : [];
    ministerios = Array.isArray(ministerios) ? ministerios : [];
    albums = Array.isArray(albums) ? albums : [];
    talentos = Array.isArray(talentos) ? talentos : [];
    pastor = Array.isArray(pastor) ? pastor : [];
    config = Array.isArray(config) ? config : [];

    const containers = {
        upcoming: document.getElementById('upcoming-events-container'),
        allEvents: document.getElementById('all-events-container'),
        ministerios: document.getElementById('ministerios-container'),
        talentos: document.getElementById('talentos-container'),
        albums: document.getElementById('albums-container')
    };

    // 1. CONFIG
    if (config.length > 0 && config[0]) {
        window.applyConfigImages(config[0]);
    }

    // 2. PASTOR
    const pastorContainer = document.getElementById('pastor-img-container');
    if (pastorContainer) {
        if (pastor.length > 0 && pastor[0].capa) {
            pastorContainer.innerHTML = '<img src="' + window.optimizeImage(pastor[0].capa, 200) + '" loading="lazy" alt="Pastor" class="w-full h-full object-cover">';
        } else {
            pastorContainer.innerHTML = '<i class="fas fa-user-tie text-xl sm:text-2xl"></i>';
        }
    }

    // 3. EVENTOS
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
            id: e.id || '',
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

    // 4. AVISOS
    const carousel = document.getElementById('avisos-carousel');
    if (avisos.length > 0) {
        console.log('📢 Renderizando carrossel de avisos:', avisos.length, 'itens');
        if (typeof window.renderAvisosCarousel === 'function') {
            window.renderAvisosCarousel(avisos);
        } else {
            console.warn('⚠️ renderAvisosCarousel não está definido');
        }
    } else {
        if (carousel) {
            carousel.classList.add('hidden');
            const slidesContainer = document.getElementById('avisos-slides');
            const dotsContainer = document.getElementById('aviso-dots');
            if (slidesContainer) slidesContainer.innerHTML = '';
            if (dotsContainer) dotsContainer.innerHTML = '';
        }
    }

    // 5. EVENTOS FUTUROS
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sorted = window.globalEvents.slice().sort((a, b) => window.parseDate(a.date) - window.parseDate(b.date));
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

    // 6. MINISTÉRIOS
    if (containers.ministerios) {
        containers.ministerios.innerHTML = ministerios.length > 0
            ? ministerios.map(m => window.createCard(m, 'ministerio')).join('')
            : '';
    }

    // 7. TALENTOS
    if (containers.talentos) {
        containers.talentos.innerHTML = talentos.length > 0
            ? talentos.map(t => window.createCard(t, 'talento')).join('')
            : '';
    }

    // 8. ÁLBUNS
    if (containers.albums) {
        containers.albums.innerHTML = albums.length > 0
            ? albums.map(a => window.createCard(a, 'album')).join('')
            : '';
    }
};

// ============================================================
// ✅ NOVO: CHECAR ATUALIZAÇÕES VIA HASH (?action=ping)
// Retorna true se o hash mudou (dados desatualizados no cliente).
// ============================================================
window.__lastDataHash = null;

window.checkForUpdates = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), window.AUTO_REFRESH_CONFIG.pingTimeout);

        const res = await fetch(
            window.CONFIG.scriptUrl + '?action=ping&cacheBust=' + Date.now(),
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) return false;

        const json = await res.json();
        const hash = json && json.hash ? String(json.hash) : null;

        if (!hash) return false;

        if (window.__lastDataHash === null) {
            // Primeira checagem — só guarda, não recarrega
            window.__lastDataHash = hash;
            return false;
        }

        if (hash !== window.__lastDataHash) {
            console.log('🔄 Hash mudou (' + window.__lastDataHash + ' → ' + hash + '). Recarregando dados...');
            window.__lastDataHash = hash;
            return true;
        }

        return false;
    } catch (e) {
        // Falha silenciosa — não trava o polling
        return false;
    }
};

// ============================================================
// ✅ NOVO: POLLING AUTOMÁTICO
// - Roda a cada 45s SOMENTE quando a aba está visível
// - Pausa quando a aba vai pra segundo plano
// - Retoma na hora que a aba volta + checa imediatamente
// - Também escuta "storage" e "BroadcastChannel" para
//   atualização INSTANTÂNEA entre abas do mesmo navegador.
// ============================================================
window.initAutoRefresh = () => {
    if (!window.AUTO_REFRESH_CONFIG.enabled) return;
    if (window.__autoRefreshStarted) return;
    window.__autoRefreshStarted = true;

    let timer = null;

    const doCheck = async () => {
        const changed = await window.checkForUpdates();
        if (changed && typeof window.loadData === 'function') {
            window.loadData(true);
        }
    };

    const start = () => {
        stop();
        timer = setInterval(doCheck, window.AUTO_REFRESH_CONFIG.intervalMs);
    };

    const stop = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };

    // Pausa/retoma conforme visibilidade da aba
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else {
            // Ao voltar pra aba, checa na hora e reinicia o timer
            doCheck();
            start();
        }
    });

    // Só inicia se a aba já está visível
    if (!document.hidden) {
        // Primeira checagem depois de 5s (dá tempo do site carregar)
        setTimeout(doCheck, 5000);
        start();
    }

    // ============================================================
    // ✅ BÔNUS: BroadcastChannel — abas do MESMO navegador
    // ============================================================
    try {
        if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('iead_data_changes');
            bc.addEventListener('message', (event) => {
                if (event && event.data && event.data.type === 'data_changed') {
                    console.log('📡 BroadcastChannel: dados mudaram em outra aba. Recarregando...');
                    if (typeof window.loadData === 'function') {
                        window.loadData(true);
                    }
                }
            });
            window.__broadcastChannel = bc;
        }
    } catch(e) {}

    // ============================================================
    // ✅ BÔNUS: storage event — abas do MESMO navegador (fallback)
    // ============================================================
    window.addEventListener('storage', (event) => {
        if (event && event.key === '__iead_data_changed') {
            console.log('💾 storage event: dados mudaram em outra aba. Recarregando...');
            if (typeof window.loadData === 'function') {
                window.loadData(true);
            }
        }
    });

    console.log('🔁 Polling automático iniciado (intervalo: ' + (window.AUTO_REFRESH_CONFIG.intervalMs / 1000) + 's)');
};

// ============================================================
// ✅ NOVO: NOTIFICAR OUTRAS ABAS (chamado pelo admin.js)
// ============================================================
window.broadcastDataChanged = () => {
    // Marca no localStorage — dispara "storage event" em outras abas
    try {
        localStorage.setItem('__iead_data_changed', String(Date.now()));
    } catch(e) {}

    // BroadcastChannel — mais rápido, só para mesmo navegador
    try {
        if (window.__broadcastChannel) {
            window.__broadcastChannel.postMessage({ type: 'data_changed', ts: Date.now() });
        } else if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('iead_data_changes');
            bc.postMessage({ type: 'data_changed', ts: Date.now() });
            bc.close();
        }
    } catch(e) {}

    // Atualiza o hash local para não recarregar à toa no próximo ping
    window.checkForUpdates();
};

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('📦 data.js carregado (com polling + preload de hero)');
