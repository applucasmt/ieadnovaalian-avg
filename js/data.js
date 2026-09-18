// ============================================================
// IEAD NOVA ALIANÇA - SISTEMA DE DADOS E CACHE
// ============================================================

window.CACHE_ENABLED_KEYS = [];

window.AUTO_REFRESH_CONFIG = {
    intervalMs: 15000,
    pingTimeout: 8000,
    enabled: true
};

// ✅ Guarda o snapshot de cada seção para evitar re-render desnecessário
window.__lastDataSnapshot = {
    eventos: '',
    avisos: '',
    ministerios: '',
    albuns: '',
    talentos: '',
    pastor: '',
    config: ''
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
// OTIMIZAÇÃO DE IMAGENS
// ============================================================
window.optimizeImage = (url, width) => {
    width = width || 800;
    if (!url || typeof url !== 'string') return url;
    if (url.indexOf('wsrv.nl') !== -1) return url;
    if (url.indexOf('.webp') !== -1) return url;
    if (url.indexOf('http') === 0) {
        const encoded = encodeURIComponent(url.replace(/^https?:\/\//, ''));
        return 'https://wsrv.nl/?url=' + encoded + '&w=' + width + '&q=75&output=webp&we=1&il';
    }
    return url;
};

// ============================================================
// PARSER DE DATAS
// ============================================================
window.parseDate = (dateStr) => {
    if(!dateStr) return new Date();
    if(dateStr instanceof Date) return dateStr;

    let d = new Date(dateStr);
    if(!isNaN(d.getTime())) return d;

    if (typeof dateStr === 'string') {
        const parts = dateStr.split('/');
        if(parts.length === 3) {
            return new Date(parts[2] + '-' + parts[1] + '-' + parts[0]);
        }
    }
    return new Date();
};

// ============================================================
// APLICAR CONFIG
// ============================================================
window.applyConfigImages = (config) => {
    console.log('🎨 applyConfigImages:', config);
    if (!config) return;

    if (config.logoUrl && typeof config.logoUrl === 'string' && config.logoUrl.trim()) {
        const logoUrl = config.logoUrl.trim();
        const logoHeader = document.getElementById('site-logo');
        const logoFooter = document.getElementById('footer-logo');
        if (logoHeader) logoHeader.src = logoUrl;
        if (logoFooter) logoFooter.src = logoUrl;

        const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
        faviconLinks.forEach(link => link.href = logoUrl);
    }

    const isMobile = window.innerWidth <= 768;
    let heroUrlToUse = '';

    if (isMobile && config.heroUrlMobile && typeof config.heroUrlMobile === 'string' && config.heroUrlMobile.trim() !== '') {
        heroUrlToUse = config.heroUrlMobile.trim();
    } else if (config.heroUrl && typeof config.heroUrl === 'string' && config.heroUrl.trim() !== '') {
        heroUrlToUse = config.heroUrl.trim();
    }

    if (heroUrlToUse) {
        const hero = document.getElementById('site-hero');
        if (hero) {
            hero.src = heroUrlToUse;
            hero.setAttribute('data-hero-url', heroUrlToUse);
        }
    }

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
// RESIZE
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
// ✅ LOAD DATA INTELIGENTE
// - Compara dados novos com os antigos
// - Só re-renderiza o que mudou
// - Não pausa rádio/vídeos se nada relevante mudou
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

        const sections = {
            eventos: Array.isArray(data.eventos) ? data.eventos : [],
            avisos: Array.isArray(data.avisos) ? data.avisos : [],
            ministerios: Array.isArray(data.ministerios) ? data.ministerios : [],
            albuns: Array.isArray(data.albuns) ? data.albuns : [],
            talentos: Array.isArray(data.talentos) ? data.talentos : [],
            pastor: Array.isArray(data.pastor) ? data.pastor : [],
            config: Array.isArray(data.config) ? data.config : []
        };

        const changed = {};
        let anyChanged = false;
        Object.keys(sections).forEach(key => {
            const currentStr = JSON.stringify(sections[key]);
            if (currentStr !== window.__lastDataSnapshot[key]) {
                changed[key] = true;
                window.__lastDataSnapshot[key] = currentStr;
                anyChanged = true;
            } else {
                changed[key] = false;
            }
        });

        if (!anyChanged && !force) {
            console.log('🟢 Nada mudou, pulando re-render.');
            if (typeof window.hideInitialLoading === 'function') {
                window.hideInitialLoading();
            }
            return;
        }

        console.log('🔄 Seções que mudaram:', Object.keys(changed).filter(k => changed[k]));

        if (changed.config && sections.config[0]) {
            if (typeof window.applyConfigImages === 'function') {
                window.applyConfigImages(sections.config[0]);
            }
        }

        if (typeof window.renderComponents === 'function') {
            window.renderComponents(
                changed.eventos ? sections.eventos : null,
                changed.avisos ? sections.avisos : null,
                changed.ministerios ? sections.ministerios : null,
                changed.albuns ? sections.albuns : null,
                changed.talentos ? sections.talentos : null,
                changed.pastor ? sections.pastor : null,
                null
            );
        }

        if (changed.talentos && typeof window.adjustTalentVideoCards === 'function') {
            setTimeout(() => window.adjustTalentVideoCards(), 100);
        }

        // Só recarrega a rádio se ela estiver aberta E se algo mudou
        const radioPage = document.getElementById('radio-page');
        if (radioPage && !radioPage.classList.contains('hidden') && anyChanged) {
            if (typeof window.__radioState !== 'undefined') {
                window.__radioState.carregado = false;
                window.__radioState.__modoPlayerRenderizado = '';
            }
            if (typeof window.renderRadioPage === 'function') {
                window.renderRadioPage();
            }
        }

        if (typeof window.hideInitialLoading === 'function') {
            window.hideInitialLoading();
        }

    } catch (e) {
        console.error('Erro ao carregar dados:', e);
        if (typeof window.renderComponents === 'function') {
            window.renderComponents([], [], [], [], [], [], null);
        }
        if (typeof window.hideInitialLoading === 'function') {
            window.hideInitialLoading();
        }
    }
};

// ============================================================
// ✅ RENDER COMPONENTS
// - Aceita null = "não mexe nesse container"
// ============================================================
window.renderComponents = (events, avisos, ministerios, albums, talentos, pastor, config) => {
    const containers = {
        upcoming: document.getElementById('upcoming-events-container'),
        allEvents: document.getElementById('all-events-container'),
        ministerios: document.getElementById('ministerios-container'),
        talentos: document.getElementById('talentos-container'),
        albums: document.getElementById('albums-container')
    };

    const shouldRenderEvents = events !== null;
    const shouldRenderAvisos = avisos !== null;
    const shouldRenderMinisterios = ministerios !== null;
    const shouldRenderAlbums = albums !== null;
    const shouldRenderTalentos = talentos !== null;
    const shouldRenderPastor = pastor !== null;

    events = Array.isArray(events) ? events : [];
    avisos = Array.isArray(avisos) ? avisos : [];
    ministerios = Array.isArray(ministerios) ? ministerios : [];
    albums = Array.isArray(albums) ? albums : [];
    talentos = Array.isArray(talentos) ? talentos : [];
    pastor = Array.isArray(pastor) ? pastor : [];
    config = Array.isArray(config) ? config : [];

    if (config.length > 0 && config[0]) {
        window.applyConfigImages(config[0]);
    }

    if (shouldRenderPastor) {
        const pastorContainer = document.getElementById('pastor-img-container');
        if (pastorContainer) {
            if (pastor.length > 0 && pastor[0].capa) {
                pastorContainer.innerHTML = '<img src="' + window.optimizeImage(pastor[0].capa, 200) + '" loading="lazy" alt="Pastor" class="w-full h-full object-cover">';
            } else {
                pastorContainer.innerHTML = '<i class="fas fa-user-tie text-xl sm:text-2xl"></i>';
            }
        }
    }

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

    if (shouldRenderEvents) {
        window.globalEvents = normalizedEvents;
    }

    if (shouldRenderEvents && typeof window.initMarketingSlider === 'function') {
        window.initMarketingSlider(window.globalEvents);
    }

    const carousel = document.getElementById('avisos-carousel');
    if (shouldRenderAvisos) {
        if (avisos.length > 0) {
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
    }

    if (shouldRenderEvents) {
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
    }

    if (shouldRenderMinisterios && containers.ministerios) {
        containers.ministerios.innerHTML = ministerios.length > 0
            ? ministerios.map(m => window.createCard(m, 'ministerio')).join('')
            : '';
    }

    if (shouldRenderTalentos && containers.talentos) {
        containers.talentos.innerHTML = talentos.length > 0
            ? talentos.map(t => window.createCard(t, 'talento')).join('')
            : '';
    }

    if (shouldRenderAlbums && containers.albums) {
        containers.albums.innerHTML = albums.length > 0
            ? albums.map(a => window.createCard(a, 'album')).join('')
            : '';
    }
};

// ============================================================
// ✅ CHECAR ATUALIZAÇÕES VIA HASH
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

        // Se é a primeira vez, guarda o hash sem recarregar
        if (window.__lastDataHash === null) {
            window.__lastDataHash = hash;
            return false;
        }

        // Se o hash mudou, marca como changed
        if (hash !== window.__lastDataHash) {
            console.log('🔄 Hash mudou. Recarregando dados...');
            window.__lastDataHash = hash;
            return true;
        }

        return false;
    } catch (e) {
        console.warn('Erro no checkForUpdates:', e);
        return false;
    }
};

// ============================================================
// ✅ POLLING ROBUSTO (sobrevive ao freezing de mobile)
// ============================================================
window.initAutoRefresh = () => {
    if (!window.AUTO_REFRESH_CONFIG.enabled) return;
    if (window.__autoRefreshStarted) return;
    window.__autoRefreshStarted = true;

    let timer = null;
    let isRunning = false;

    const doCheck = async () => {
        if (isRunning) return;
        isRunning = true;
        try {
            const changed = await window.checkForUpdates();
            console.log('🔍 checkForUpdates retornou:', changed);
            if (changed && typeof window.loadData === 'function') {
                window.loadData(true);
            }
        } catch (e) {
            console.error('Erro no doCheck:', e);
        } finally {
            isRunning = false;
        }
    };

    const scheduleNext = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(async () => {
            await doCheck();
            scheduleNext();
        }, window.AUTO_REFRESH_CONFIG.intervalMs);
    };

    const start = () => {
        stop();
        scheduleNext();
    };

    const stop = () => {
        if (timer) {
            clearTimeout(timer);
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

    window.addEventListener('focus', () => {
        if (!document.hidden) {
            doCheck();
            start();
        }
    });

    let lastInteractionCheck = 0;
    const onUserInteraction = () => {
        const now = Date.now();
        if (now - lastInteractionCheck > 5000) {
            lastInteractionCheck = now;
            doCheck();
        }
    };

    document.addEventListener('touchstart', onUserInteraction, { passive: true });
    document.addEventListener('click', onUserInteraction, { passive: true });

    if (!document.hidden) {
        setTimeout(doCheck, 3000);
        start();
    }

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

    window.addEventListener('storage', (event) => {
        if (event && event.key === '__iead_data_changed') {
            console.log('💾 storage event: dados mudaram em outra aba. Recarregando...');
            if (typeof window.loadData === 'function') {
                window.loadData(true);
            }
        }
    });

    console.log('🔁 Polling iniciado (' + (window.AUTO_REFRESH_CONFIG.intervalMs / 1000) + 's) — modo robusto para mobile');
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
// TELA DE LOADING
// ============================================================
window.hideInitialLoading = () => {
    const el = document.getElementById('initial-loading');
    if (!el) return;
    if (el.classList.contains('is-hiding') || el.classList.contains('is-hidden')) return;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                el.classList.add('is-hiding');
                setTimeout(() => {
                    el.classList.add('is-hidden');
                }, 600);
            }, 600);
        });
    });
};

window.__initialLoadingWatchdog = setTimeout(() => {
    console.warn('⏱️ Watchdog do loading acionado (10s)');
    window.hideInitialLoading();
}, 10000);

// ============================================================
// HELPERS DE YOUTUBE
// ============================================================
window.extractYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/
    ];
    for (let i = 0; i < patterns.length; i++) {
        const match = url.match(patterns[i]);
        if (match && match[1]) return match[1];
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
};

window.buildYouTubeEmbed = (videoId, options) => {
    options = options || {};
    const autoplay = options.autoplay !== false ? 1 : 0;
    const mute = options.mute !== false ? 1 : 0;
    const loop = options.loop !== false ? 1 : 0;
    const controls = options.controls !== false ? 1 : 0;
    const params = [
        'autoplay=' + autoplay,
        'mute=' + mute,
        'loop=' + loop,
        'playlist=' + videoId,
        'controls=' + controls,
        'playsinline=1',
        'rel=0',
        'modestbranding=1'
    ];
    return 'https://www.youtube.com/embed/' + videoId + '?' + params.join('&');
};

window.resolveVideoAspect = (videoFormat, videoId) => {
    if (videoFormat === 'vertical') return Promise.resolve('9 / 16');
    if (videoFormat === 'horizontal') return Promise.resolve('16 / 9');
    return window.detectYouTubeAspect(videoId);
};

window.detectYouTubeAspect = (videoId) => {
    return new Promise((resolve) => {
        let resolved = false;
        const finish = (ratio) => {
            if (resolved) return;
            resolved = true;
            resolve(ratio);
        };

        setTimeout(() => finish('16 / 9'), 3000);

        const img1 = new Image();
        img1.onload = () => {
            if (img1.naturalWidth >= 1000) {
                finish('16 / 9');
            } else {
                tryOar2();
            }
        };
        img1.onerror = () => tryOar2();
        img1.src = 'https://i.ytimg.com/vi/' + videoId + '/maxresdefault.jpg';

        const tryOar2 = () => {
            const img2 = new Image();
            img2.onload = () => {
                const w = img2.naturalWidth;
                const h = img2.naturalHeight;
                if (w && h && h > w) {
                    finish('9 / 16');
                } else {
                    finish('16 / 9');
                }
            };
            img2.onerror = () => finish('16 / 9');
            img2.src = 'https://i.ytimg.com/vi/' + videoId + '/oar2.jpg';
        };
    });
};

console.log('📦 data.js carregado');
