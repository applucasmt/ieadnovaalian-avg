// ============================================================
// IEAD NOVA ALIANÇA - SISTEMA DE DADOS E CACHE
// ✅ Otimizado: 1 endpoint ?action=all (em vez de 7 requisições)
// ✅ Ping instantâneo via PropertiesService
// ✅ Polling de 15s
// ✅ Renderização progressiva
// ============================================================

window.CACHE_ENABLED_KEYS = [];

window.AUTO_REFRESH_CONFIG = {
    intervalMs: 15000,       // ✅ 15s (antes era 45s)
    pingTimeout: 8000,       // timeout do ping
    enabled: true
};

// ============================================================
// LIMPA TODO O CACHE
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
    console.log('🧹 clearAppCache: cache limpo.');
};

// ============================================================
// FETCH — SEM CACHE
// ============================================================
window.fetchWithCache = async (url, key, force) => {
    force = force || false;

    try {
        const response = await fetch(url + '&cacheBust=' + Date.now());
        if (!response.ok) throw new Error('Network error');
        return await response.json();
    } catch (error) {
        console.error('Erro fetch ' + key + ':', error);
        return [];
    }
};

// ============================================================
// PRÉ-CARREGAR IMAGEM
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

        setTimeout(() => finish(url), timeoutMs);
    });
};

// ============================================================
// APLICAR CONFIG
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

    // HERO IMAGEM
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
            console.log('🖼️ Hero aplicado:', heroUrlToUse);
        }
    }

    // TEXTOS DO HERO
    const badgeEl = document.getElementById('hero-badge');
    const titleEl = document.getElementById('hero-title');
    const descEl = document.getElementById('hero-description');

    if (badgeEl) {
        if (config.heroSubtitle && config.heroSubtitle.trim()) {
            badgeEl.textContent = config.heroSubtitle.trim();
            badgeEl.style.display = 'inline-block';
        } else {
            badgeEl.style.display = 'none';
        }
    }

    if (titleEl) {
        if (config.heroTitle && config.heroTitle.trim()) {
            const parts = config.heroTitle.split('\\n');
            if (parts.length > 1) {
                titleEl.innerHTML = parts[0] + '<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">' + parts[1] + '</span>';
            } else {
                titleEl.textContent = config.heroTitle;
            }
        }
    }

    if (descEl) {
        descEl.textContent = (config.heroDescription && config.heroDescription.trim()) ? config.heroDescription.trim() : '';
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
// RESIZE — re-aplica config
// ============================================================
let lastIsMobile = window.innerWidth <= 768;
window.addEventListener('resize', () => {
    const currentIsMobile = window.innerWidth <= 768;
    if (currentIsMobile !== lastIsMobile) {
        lastIsMobile = currentIsMobile;
        if (typeof window.loadData === 'function') {
            window.loadData(true);
        }
    }
});

// ============================================================
// ✅ CARREGAR DADOS — 1 REQUISIÇÃO (?action=all)
// ------------------------------------------------------------
// FASE 1: busca tudo em 1 request e renderiza.
// FASE 2: nada. (Antes eram 7 requests.)
// ============================================================
window.loadData = async (force) => {
    force = force === true;

    try {
        const response = await fetch(
            window.CONFIG.scriptUrl + '?action=all&cacheBust=' + Date.now()
        );

        if (!response.ok) throw new Error('Network error');
        const data = await response.json();

        if (data && data._hash) {
            window.__lastDataHash = String(data._hash);
        }

        const config = Array.isArray(data.config) ? data.config : [];
        if (typeof window.applyConfigImages === 'function') {
            window.applyConfigImages(config.length > 0 ? config[0] : {});
        }

        if (typeof window.renderComponents === 'function') {
            window.renderComponents(
                Array.isArray(data.eventos) ? data.eventos : [],
                Array.isArray(data.avisos) ? data.avisos : [],
                Array.isArray(data.ministerios) ? data.ministerios : [],
                Array.isArray(data.albuns) ? data.albuns : [],
                Array.isArray(data.talentos) ? data.talentos : [],
                Array.isArray(data.pastor) ? data.pastor : [],
                null
            );
        }

        // ✅ Esconde a tela de loading
        if (typeof window.hideInitialLoading === 'function') {
            window.hideInitialLoading();
        }

    } catch (e) {
        console.error('Erro ao carregar dados:', e);
        if (typeof window.renderComponents === 'function') {
            window.renderComponents([], [], [], [], [], [], null);
        }

        // ✅ Mesmo em caso de erro, esconde a tela de loading
        if (typeof window.hideInitialLoading === 'function') {
            window.hideInitialLoading();
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

    if (config.length > 0 && config[0]) {
        window.applyConfigImages(config[0]);
    }

    // PASTOR
    const pastorContainer = document.getElementById('pastor-img-container');
    if (pastorContainer) {
        if (pastor.length > 0 && pastor[0].capa) {
            pastorContainer.innerHTML = '<img src="' + window.optimizeImage(pastor[0].capa, 200) + '" loading="lazy" alt="Pastor" class="w-full h-full object-cover">';
        } else {
            pastorContainer.innerHTML = '<i class="fas fa-user-tie text-xl sm:text-2xl"></i>';
        }
    }

    // EVENTOS
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

    // AVISOS
    const carousel = document.getElementById('avisos-carousel');
    if (avisos.length > 0) {
        console.log('📢 Renderizando carrossel de avisos:', avisos.length, 'itens');
        if (typeof window.renderAvisosCarousel === 'function') {
            window.renderAvisosCarousel(avisos);
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

    // EVENTOS FUTUROS
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

    // MINISTÉRIOS
    if (containers.ministerios) {
        containers.ministerios.innerHTML = ministerios.length > 0
            ? ministerios.map(m => window.createCard(m, 'ministerio')).join('')
            : '';
    }

    // TALENTOS
    if (containers.talentos) {
        containers.talentos.innerHTML = talentos.length > 0
            ? talentos.map(t => window.createCard(t, 'talento')).join('')
            : '';
    }

    // ÁLBUNS
    if (containers.albums) {
        containers.albums.innerHTML = albums.length > 0
            ? albums.map(a => window.createCard(a, 'album')).join('')
            : '';
    }
};

// ============================================================
// CHECAR ATUALIZAÇÕES VIA HASH (?action=ping)
// ✅ Agora o ping lê só uma string (instantâneo)
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
            window.__lastDataHash = hash;
            return false;
        }

        if (hash !== window.__lastDataHash) {
            console.log('🔄 Hash mudou. Recarregando dados...');
            window.__lastDataHash = hash;
            return true;
        }

        return false;
    } catch (e) {
        return false;
    }
};

// ============================================================
// POLLING AUTOMÁTICO (15s)
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

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else {
            doCheck();
            start();
        }
    });

    if (!document.hidden) {
        setTimeout(doCheck, 3000);
        start();
    }

    try {
        if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('iead_data_changes');
            bc.addEventListener('message', (event) => {
                if (event && event.data && event.data.type === 'data_changed') {
                    console.log('📡 BroadcastChannel: dados mudaram. Recarregando...');
                    if (typeof window.loadData === 'function') {
                        window.loadData(true);
                    }
                }
            });
            window.__broadcastChannel = bc;
        }
    } catch(e) {}

    window.addEventListener('storage', (event) => {
        if (event && event.key === '__iead_data_changed') {
            console.log('💾 storage event: dados mudaram. Recarregando...');
            if (typeof window.loadData === 'function') {
                window.loadData(true);
            }
        }
    });

    console.log('🔁 Polling iniciado (15s)');
};

// ============================================================
// NOTIFICAR OUTRAS ABAS
// ============================================================
window.broadcastDataChanged = () => {
    try {
        localStorage.setItem('__iead_data_changed', String(Date.now()));
    } catch(e) {}

    try {
        if (window.__broadcastChannel) {
            window.__broadcastChannel.postMessage({ type: 'data_changed', ts: Date.now() });
        } else if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('iead_data_changes');
            bc.postMessage({ type: 'data_changed', ts: Date.now() });
            bc.close();
        }
    } catch(e) {}

    window.checkForUpdates();
};

// ============================================================
// ✅ TELA DE LOADING — esconder quando o site está pronto
// ============================================================
window.hideInitialLoading = () => {
    const el = document.getElementById('initial-loading');
    if (!el) return;
    if (el.classList.contains('is-hiding') || el.classList.contains('is-hidden')) return;

    // ✅ Espera o próximo frame de renderização (garante que o
    //    navegador já pintou os cards/avisos na tela antes de esconder)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Pequeno delay extra para garantir que imagens em lazy-load
            // já começaram a aparecer
            setTimeout(() => {
                el.classList.add('is-hiding');

                // Depois da transição, marca como hidden (remove do fluxo)
                setTimeout(() => {
                    el.classList.add('is-hidden');
                }, 600);
            }, 600);
        });
    });
};

// ✅ Watchdog: se nada esconder em 10s, esconde de qualquer forma
window.__initialLoadingWatchdog = setTimeout(() => {
    console.warn('⏱️ Watchdog do loading acionado (10s)');
    window.hideInitialLoading();
}, 10000);
// ============================================================
// LOG
// ============================================================
console.log('📦 data.js carregado (1 endpoint + ping rápido + polling 15s)');
