// ============================================================
// IEAD NOVA ALIANÇA - RÁDIO
// ============================================================

// ============================================================
// DETECTAR PROGRAMA ATUAL
// ============================================================
window.getCurrentRadioProgram = (programas) => {
    if (!Array.isArray(programas) || programas.length === 0) return null;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const active = programas.filter(p => String(p.ativo).toLowerCase() !== 'false');
    
    for (const p of active) {
        const ini = parseTimeToMinutes(p.inicio);
        const fim = parseTimeToMinutes(p.fim);
        if (ini === null || fim === null) continue;
        
        // Trata programas que cruzam meia-noite (ex: 23:00 - 01:00)
        if (fim > ini) {
            if (currentMinutes >= ini && currentMinutes < fim) return p;
        } else {
            // Atravessa meia-noite
            if (currentMinutes >= ini || currentMinutes < fim) return p;
        }
    }
    return null;
};

function parseTimeToMinutes(str) {
    if (!str) return null;
    const match = String(str).trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
}

// ============================================================
// RENDERIZAR ABA RÁDIO
// ============================================================
window.renderRadioPage = async () => {
    const container = document.getElementById('radio-content-area');
    if (!container) return;
    
    container.innerHTML =
        '<div class="text-center py-16">' +
            '<i class="fas fa-circle-notch fa-spin text-4xl text-brand-yellow mb-4"></i>' +
            '<p class="text-gray-400">Carregando programação...</p>' +
        '</div>';
    
    try {
        const [programas, liveConfig] = await Promise.all([
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=radio', 'cache_radio_v2', true),
            window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=config_radio', 'cache_config_radio_v2', true)
        ]);
        
        const programasArr = Array.isArray(programas) ? programas : [];
        const liveCfg = (Array.isArray(liveConfig) && liveConfig[0]) ? liveConfig[0] : { facebookLiveUrl: '', isLive: 'false' };
        const isLive = String(liveCfg.isLive).toLowerCase() === 'true' && liveCfg.facebookLiveUrl;
        const currentProgram = window.getCurrentRadioProgram(programasArr);
        
        // WhatsApp do programa atual (ou fallback)
        const whatsappNumber = currentProgram && currentProgram.whatsapp
            ? String(currentProgram.whatsapp).replace(/\D/g, '')
            : '5565992977124'; // Fallback: Marketing
        
        const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent('Olá! Gostaria de pedir um louvor.');
        
        // Programa atual ou próximo
        let programInfoHTML = '';
        if (currentProgram) {
            programInfoHTML =
                '<div class="radio-now-playing">' +
                    '<div class="radio-live-badge"><span class="radio-live-dot"></span> NO AR AGORA</div>' +
                    '<h3 class="radio-program-name">' + (currentProgram.programa || 'Programa') + '</h3>' +
                    '<p class="radio-program-time">' + (currentProgram.inicio || '?') + ' — ' + (currentProgram.fim || '?') + '</p>' +
                '</div>';
        } else {
            programInfoHTML =
                '<div class="radio-now-playing radio-off-air">' +
                    '<div class="radio-off-air-badge">FORA DO AR</div>' +
                    '<h3 class="radio-program-name">Sem programação agora</h3>' +
                    '<p class="radio-program-time">Confira a grade completa abaixo</p>' +
                '</div>';
        }
        
        // Player
        let playerHTML = '';
        if (isLive) {
            // Facebook Live embed
            const fbUrl = encodeURIComponent(liveCfg.facebookLiveUrl);
            playerHTML =
                '<div class="radio-player-wrapper">' +
                    '<div class="radio-player-header radio-player-live">' +
                        '<span class="radio-live-dot"></span> TRANSMISSÃO AO VIVO' +
                    '</div>' +
                    '<div class="radio-player-container radio-player-fb">' +
                        '<iframe ' +
                            'src="https://www.facebook.com/plugins/video.php?href=' + fbUrl + '&show_text=false&width=560&height=315" ' +
                            'width="100%" height="100%" ' +
                            'style="border:none;overflow:hidden;" ' +
                            'scrolling="no" frameborder="0" ' +
                            'allowfullscreen="true" ' +
                            'allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">' +
                        '</iframe>' +
                    '</div>' +
                    '<div class="radio-player-footer">' +
                        '<button onclick="window.toggleRadioPlayer(\'radio\')" class="radio-player-toggle">' +
                            '<i class="fas fa-radio"></i> Ouvir somente a Rádio' +
                        '</button>' +
                    '</div>' +
                '</div>';
        } else {
            playerHTML =
                '<div class="radio-player-wrapper">' +
                    '<div class="radio-player-header">' +
                        '<i class="fas fa-signal text-brand-yellow"></i> RÁDIO ONLINE' +
                    '</div>' +
                    '<div class="radio-player-container radio-player-online">' +
                        '<iframe src="https://nazarenofm.com/" title="Rádio Nazareno FM" style="border:0;" allowfullscreen></iframe>' +
                    '</div>' +
                '</div>';
        }
        
        // Grade completa
        let gradeHTML = '';
        if (programasArr.length > 0) {
            const sorted = [...programasArr].filter(p => String(p.ativo).toLowerCase() !== 'false')
                .sort((a, b) => {
                    const ai = parseTimeToMinutes(a.inicio) || 0;
                    const bi = parseTimeToMinutes(b.inicio) || 0;
                    return ai - bi;
                });
            
            gradeHTML =
                '<div class="radio-grade">' +
                    '<h2 class="radio-grade-title"><i class="fas fa-list text-brand-yellow"></i> Programação</h2>' +
                    '<div class="radio-grade-list">' +
                        sorted.map(p => {
                            const isCurrent = currentProgram && p.id === currentProgram.id;
                            return '<div class="radio-grade-item ' + (isCurrent ? 'radio-grade-current' : '') + '">' +
                                '<div class="radio-grade-time">' +
                                    '<span class="radio-grade-hour">' + (p.inicio || '?') + '</span>' +
                                    '<span class="radio-grade-sep">—</span>' +
                                    '<span class="radio-grade-hour">' + (p.fim || '?') + '</span>' +
                                '</div>' +
                                '<div class="radio-grade-info">' +
                                    '<span class="radio-grade-name">' + (p.programa || 'Programa') + '</span>' +
                                    (isCurrent ? '<span class="radio-grade-now">● NO AR</span>' : '') +
                                '</div>' +
                            '</div>';
                        }).join('') +
                    '</div>' +
                '</div>';
        }
        
        container.innerHTML =
            '<div class="radio-page-inner">' +
                // BLOCO 1: Programa atual
                '<div class="radio-now-block">' +
                    programInfoHTML +
                    '<a href="' + whatsappUrl + '" target="_blank" class="radio-whatsapp-btn">' +
                        '<i class="fab fa-whatsapp text-xl"></i>' +
                        '<div>' +
                            '<span class="radio-whatsapp-label">Peça seu louvor</span>' +
                            '<span class="radio-whatsapp-number">' + (currentProgram && currentProgram.programa ? currentProgram.programa : 'Rádio Nazareno') + '</span>' +
                        '</div>' +
                    '</a>' +
                '</div>' +
                // BLOCO 2: Player
                playerHTML +
                // BLOCO 3: Grade
                gradeHTML +
            '</div>';
        
    } catch (e) {
        console.error('Erro ao carregar rádio:', e);
        container.innerHTML = '<div class="text-center py-10 text-red-400">Erro ao carregar a rádio. Tente novamente.</div>';
    }
};

// ============================================================
// TOGGLE PLAYER (Live ↔ Rádio)
// ============================================================
window.toggleRadioPlayer = (mode) => {
    // Sempre recarrega a página da rádio (vai buscar de novo)
    window.renderRadioPage();
};

console.log('📻 radio.js carregado');
