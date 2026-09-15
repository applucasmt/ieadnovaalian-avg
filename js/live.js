// ============================================================
// IEAD NOVA ALIANÇA - LIVE + YOUTUBE RECENTES
// ============================================================

// ============================================================
// STATUS AO VIVO (verifica se há transmissão ativa)
// ============================================================
window.checkLive = async () => {
    const container = document.getElementById('live-container');
    if (!container) return;

    // Mostra loading
    container.innerHTML =
        '<div class="text-center animate-pulse">' +
            '<i class="fas fa-circle-notch fa-spin text-4xl text-brand-yellow mb-4"></i>' +
            '<p class="text-gray-400">Verificando status da transmissão...</p>' +
        '</div>';

    try {
        const channelId = window.CONFIG.youtubeChannel;
        const apiKey = window.CONFIG.youtubeKey;

        const url = 'https://www.googleapis.com/youtube/v3/search' +
            '?part=snippet' +
            '&channelId=' + encodeURIComponent(channelId) +
            '&eventType=live' +
            '&type=video' +
            '&maxResults=1' +
            '&key=' + encodeURIComponent(apiKey);

        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            // ESTÁ AO VIVO
            const video = data.items[0];
            const videoId = video.id.videoId;
            const title = video.snippet.title;

            container.innerHTML =
                '<div class="w-full">' +
                    '<div class="video-wrapper rounded-xl overflow-hidden bg-black">' +
                        '<iframe ' +
                            'src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0" ' +
                            'title="' + title.replace(/"/g, '&quot;') + '" ' +
                            'frameborder="0" ' +
                            'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
                            'allowfullscreen>' +
                        '</iframe>' +
                    '</div>' +
                    '<div class="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">' +
                        '<div class="flex items-center gap-2">' +
                            '<span class="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>' +
                            '<span class="text-sm text-red-400 font-bold">AO VIVO AGORA</span>' +
                        '</div>' +
                        '<a href="https://www.youtube.com/watch?v=' + videoId + '" target="_blank" class="text-brand-yellow hover:text-white text-sm font-bold flex items-center gap-2 transition-colors">' +
                            'Assistir no YouTube <i class="fas fa-external-link-alt"></i>' +
                        '</a>' +
                    '</div>' +
                '</div>';
        } else {
            // OFFLINE
            container.innerHTML =
                '<div class="text-center py-10 px-6">' +
                    '<div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">' +
                        '<i class="fas fa-video-slash text-3xl text-red-400"></i>' +
                    '</div>' +
                    '<h3 class="text-xl sm:text-2xl font-bold text-white mb-3">Nenhuma transmissão ao vivo agora</h3>' +
                    '<p class="text-gray-400 mb-6 max-w-md mx-auto">Volte no próximo culto ou assista aos últimos vídeos abaixo.</p>' +
                    '<a href="https://www.youtube.com/@ieadsetornovaalianca" target="_blank" class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-full transition-all shadow-lg">' +
                        '<i class="fab fa-youtube text-lg"></i> Visitar canal no YouTube' +
                    '</a>' +
                '</div>';
        }
    } catch (e) {
        console.error('Erro ao verificar live:', e);
        container.innerHTML =
            '<div class="text-center py-10 px-6">' +
                '<i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>' +
                '<p class="text-gray-400">Não foi possível verificar o status. Tente novamente mais tarde.</p>' +
            '</div>';
    }
};

// ============================================================
// CARREGAR VÍDEOS RECENTES DO YOUTUBE
// ============================================================
window.loadRecentVideos = async () => {
    const section = document.getElementById('youtube-recent-section');
    const container = document.getElementById('youtube-recent-container');
    if (!container) return;

    try {
        const channelId = window.CONFIG.youtubeChannel;
        const apiKey = window.CONFIG.youtubeKey;

        // ✅ Busca os 6 vídeos mais recentes do canal
        const url = 'https://www.googleapis.com/youtube/v3/search' +
            '?part=snippet' +
            '&channelId=' + encodeURIComponent(channelId) +
            '&type=video' +
            '&order=date' +
            '&maxResults=6' +
            '&key=' + encodeURIComponent(apiKey);

        const response = await fetch(url);
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.warn('Nenhum vídeo encontrado no canal.');
            if (section) section.classList.add('hidden');
            return;
        }

        // Renderiza os cards
        const html = data.items.map(item => {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const thumb = item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '';
            const published = item.snippet.publishedAt;
            const channelTitle = item.snippet.channelTitle;

            // Formata data relativa
            const dateObj = new Date(published);
            const now = new Date();
            const diffMs = now - dateObj;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            let dateStr = '';
            if (diffDays === 0) dateStr = 'Hoje';
            else if (diffDays === 1) dateStr = 'Ontem';
            else if (diffDays < 7) dateStr = diffDays + ' dias atrás';
            else if (diffDays < 30) dateStr = Math.floor(diffDays / 7) + ' sem atrás';
            else if (diffDays < 365) dateStr = Math.floor(diffDays / 30) + ' meses atrás';
            else dateStr = Math.floor(diffDays / 365) + ' ano(s) atrás';

            // Escapa HTML básico
            const safeTitle = String(title).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeChannel = String(channelTitle).replace(/</g, '&lt;').replace(/>/g, '&gt;');

            return '<a href="https://www.youtube.com/watch?v=' + videoId + '" target="_blank" rel="noopener noreferrer" class="yt-card group">' +
                        '<div class="yt-card-thumb">' +
                            '<img src="' + thumb + '" alt="' + safeTitle + '" loading="lazy" onerror="this.style.display=\'none\'">' +
                            '<div class="yt-card-overlay">' +
                                '<div class="yt-card-play">' +
                                    '<i class="fab fa-youtube"></i>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="yt-card-info">' +
                            '<h3 class="yt-card-title">' + safeTitle + '</h3>' +
                            '<div class="yt-card-meta">' +
                                '<span>' + safeChannel + '</span>' +
                                '<span class="text-gray-500">•</span>' +
                                '<span>' + dateStr + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</a>';
        }).join('');

        container.innerHTML = html;

        // Mostra a seção
        if (section) section.classList.remove('hidden');

    } catch (e) {
        console.error('Erro ao carregar vídeos recentes:', e);
        if (container) {
            container.innerHTML =
                '<div class="col-span-full text-center py-10">' +
                    '<i class="fas fa-exclamation-triangle text-3xl text-yellow-500 mb-3"></i>' +
                    '<p class="text-gray-400">Não foi possível carregar os vídeos.</p>' +
                '</div>';
        }
    }
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Quando a página "aovivo" é aberta, carrega os vídeos
    // (o switchPage já chama checkLive, e nós adicionamos loadRecentVideos)
    const originalCheckLive = window.checkLive;
    window.checkLive = async () => {
        await originalCheckLive();
        await window.loadRecentVideos();
    };
});

console.log('📺 live.js carregado (com vídeos recentes do YouTube)');
