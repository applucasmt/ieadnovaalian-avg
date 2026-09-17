// ============================================================
// IEAD NOVA ALIANÇA - SISTEMA DE DADOS E CACHE
// ============================================================

window.CACHE_ENABLED_KEYS = [];

window.AUTO_REFRESH_CONFIG = {
    intervalMs: 15000,
    pingTimeout: 8000,
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
// CARREGAR DADOS — 1 REQUISIÇÃO (?action=all)
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

        if (typeof window.adjustTalentVideoCards === 'function') {
            setTimeout(() => window.adjustTalentVideoCards(), 100);
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

    const pastorContainer = document.getElementById('pastor-img-container');
    if (pastorContainer) {
        if (pastor.length > 0 && pastor[0].capa) {
            pastorContainer.innerHTML = '<img src="' + window.optimizeImage(pastor[0].capa, 200) + '" loading="lazy" alt="Pastor" class="w-full h-full object-cover">';
        } else {
            pastorContainer.innerHTML = '<i class="fas fa-user-tie text-xl sm:text-2xl"></i>';
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

    window.globalEvents = normalizedEvents;

    if (typeof window.initMarketingSlider === 'function') {
        window.initMarketingSlider(window.globalEvents);
    }

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

    if (containers.ministerios) {
        containers.ministerios.innerHTML = ministerios.length > 0
            ? ministerios.map(m => window.createCard(m, 'ministerio')).join('')
            : '';
    }

    if (containers.talentos) {
        containers.talentos.innerHTML = talentos.length > 0
            ? talentos.map(t => window.createCard(t, 'talento')).join('')
            : '';
    }

    if (containers.albums) {
        containers.albums.innerHTML = albums.length > 0
            ? albums.map(a => window.createCard(a, 'album')).join('')
            : '';
    }
};

// ============================================================
// CHECAR ATUALIZAÇÕES VIA HASH
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
// ✅ HELPERS DE YOUTUBE
// ============================================================

// Extrai o ID do vídeo de qualquer URL do YouTube
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

// Monta URL do embed com autoplay + mute + loop + playsinline
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

// ============================================================
// ✅ DETECÇÃO DE PROPORÇÃO DO YOUTUBE
// ------------------------------------------------------------
// Estratégia:
//   1. Tenta carregar "maxresdefault.jpg" (1280x720)
//   2. Se carregar E tiver largura >= 1000px → é 16:9 (horizontal)
//   3. Se carregar com largura menor (é o "hq720.jpg" de shorts,
//      que fica 720x1280 mas o YouTube às vezes devolve 480x360)
//      → checa a proporção real
//   4. Se NÃO carregar (maxres não existe para shorts) →
//      tenta "oar2.jpg" (que é específica de shorts 9:16)
//   5. Se nada funcionar → assume 16:9
// ============================================================
window.detectYouTubeAspect = (videoId) => {
    return new Promise((resolve) => {
        let resolved = false;
        const finish = (ratio) => {
            if (resolved) return;
            resolved = true;
            resolve(ratio);
        };

        // Timeout de segurança
        setTimeout(() => finish('16 / 9'), 3000);

        // Tentativa 1: maxresdefault (1280x720) — só existe para vídeos horizontais
        const img1 = new Image();
        img1.onload = () => {
            if (img1.naturalWidth >= 1000) {
                // Maxres real → horizontal 16:9
                finish('16 / 9');
            } else {
                // Maxres não é real (é fallback) → tenta oar2.jpg
                tryOar2();
            }
        };
        img1.onerror = () => {
            // maxres não existe → pode ser short
            tryOar2();
        };
        img1.src = 'https://i.ytimg.com/vi/' + videoId + '/maxresdefault.jpg';

        // Tentativa 2: oar2.jpg — específica de shorts verticais (1080x1920)
        const tryOar2 = () => {
            const img2 = new Image();
            img2.onload = () => {
                const w = img2.naturalWidth;
                const h = img2.naturalHeight;
                if (w && h && h > w) {
                    // Vertical (short) → 9:16
                    finish('9 / 16');
                } else {
                    // Horizontal
                    finish('16 / 9');
                }
            };
            img2.onerror = () => {
                // Não tem oar2 → provavelmente horizontal normal
                finish('16 / 9');
            };
            img2.src = 'https://i.ytimg.com/vi/' + videoId + '/oar2.jpg';
        };
    });
};

// ============================================================
// ✅ DETECÇÃO DE PROPORÇÃO DE IMAGEM QUALQUER (para talentos com capa)
// Retorna Promise que resolve com "W / H" da imagem.
// ============================================================
window.detectImageAspect = (url) => {
    return new Promise((resolve) => {
        if (!url || typeof url !== 'string' || !url.trim()) {
            resolve(null);
            return;
        }

        let done = false;
        const finish = (ratio) => {
            if (done) return;
            done = true;
            resolve(ratio);
        };

        // Timeout de segurança
        setTimeout(() => finish(null), 4000);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            if (img.naturalWidth && img.naturalHeight) {
                finish(img.naturalWidth + ' / ' + img.naturalHeight);
            } else {
                finish(null);
            }
        };
        img.onerror = () => finish(null);
        img.src = url;
    });
};

// ============================================================
// LOG
// ============================================================
console.log('📦 data.js carregado');
