// ============================================================
// IEAD NOVA ALIANÇA - YOUTUBE LIVE CHECK
// ============================================================

// ============================================================
// VERIFICAR SE ESTÁ AO VIVO NO YOUTUBE
// ============================================================
window.checkLive = async () => {
    const container = document.getElementById('live-container');
    if (!container) return;
    
    const domain = window.location.hostname;

    // ============================================================
    // RENDERIZAR PLAYER (com ou sem videoId específico)
    // ============================================================
    const renderPlayer = (videoId) => {
        let embedSrc = '';
        const params = 'autoplay=1&modestbranding=1&rel=0&playsinline=1&origin=https://' + domain;
        
        if (videoId) {
            // Vídeo específico encontrado via API
            embedSrc = 'https://www.youtube.com/embed/' + videoId + '?' + params;
        } else {
            // Fallback: embed do canal ao vivo
            embedSrc = 'https://www.youtube.com/embed/live_stream?channel=' + window.CONFIG.youtubeChannel + '&' + params;
        }

        container.innerHTML = 
            '<div class="w-full animate-fade-in">' +
                '<div class="video-wrapper w-full shadow-2xl border border-white/10 relative">' +
                    '<iframe width="560" height="315" ' +
                        'src="' + embedSrc + '" ' +
                        'title="Culto Ao Vivo" ' +
                        'frameborder="0" ' +
                        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
                        'referrerpolicy="strict-origin-when-cross-origin" ' +
                        'allowfullscreen>' +
                    '</iframe>' +
                '</div>' +
                '<div class="flex justify-between items-center mt-3 px-2 flex-wrap gap-2">' +
                    '<div class="flex items-center gap-2">' +
                        '<span class="relative flex h-3 w-3">' +
                            '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>' +
                            '<span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>' +
                        '</span>' +
                        '<p class="text-xs text-gray-400">Transmissão Oficial</p>' +
                    '</div>' +
                    '<div class="flex gap-4 flex-wrap">' +
                        '<button onclick="if(navigator.share) navigator.share({title: \'Culto Ao Vivo - IEAD Nova Aliança\', url: \'https://www.youtube.com/channel/' + window.CONFIG.youtubeChannel + '/live\'})" class="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">' +
                            '<i class="fas fa-share-alt"></i> Compartilhar' +
                        '</button>' +
                        '<a href="https://www.youtube.com/channel/' + window.CONFIG.youtubeChannel + '/live" target="_blank" class="text-xs text-brand-yellow hover:underline transition-colors flex items-center gap-1">' +
                            'Assistir no YouTube <i class="fas fa-external-link-alt"></i>' +
                        '</a>' +
                    '</div>' +
                '</div>' +
            '</div>';
    };

    // ============================================================
    // BUSCAR DADOS VIA API DO YOUTUBE
    // ============================================================
    try {
        const apiUrl = 'https://www.googleapis.com/youtube/v3/search' +
            '?part=snippet' +
            '&channelId=' + window.CONFIG.youtubeChannel +
            '&eventType=live' +
            '&type=video' +
            '&key=' + window.CONFIG.youtubeKey;
        
        const res = await fetch(apiUrl);
        
        if (!res.ok) throw new Error('API Error: ' + res.status);

        const data = await res.json();

        if (data.items && data.items.length > 0) {
            // Está ao vivo - pega o videoId específico
            renderPlayer(data.items[0].id.videoId);
        } else {
            // Não está ao vivo - usa embed do canal
            renderPlayer();
        }
    } catch (e) {
        console.log('Live check failed, usando fallback:', e);
        renderPlayer();
    }
};

// ============================================================
// CACHE DO STATUS LIVE (evita chamadas repetidas)
// ============================================================
let liveCheckCache = {
    timestamp: 0,
    isLive: false,
    videoId: null
};

window.checkLiveCached = async () => {
    const now = Date.now();
    const cacheAge = 60000; // 1 minuto
    
    // Se o cache for recente, usa
    if (now - liveCheckCache.timestamp < cacheAge) {
        console.log('Usando cache do live check');
        return liveCheckCache;
    }
    
    // Senão, faz nova chamada
    await window.checkLive();
    liveCheckCache.timestamp = now;
};

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('📺 live.js carregado');
