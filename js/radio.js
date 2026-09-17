// ============================================================
// IEAD NOVA ALIANÇA - RÁDIO
// ============================================================

window.__radioState = {
    programas: [],
    liveConfig: { facebookLiveUrl: '', isLive: 'false' },
    currentProgram: null,
    userChoseRadio: false,
    carregado: false
};

// ============================================================
// HELPERS
// ============================================================
function formatHora(h) {
    if (!h) return '?';
    const s = String(h);
    if (s.indexOf('T') !== -1) {
        const t = s.split('T')[1];
        return t ? t.substring(0, 5) : '?';
    }
    return s.substring(0, 5);
}

function parseTimeToMinutes(str) {
    if (!str) return null;
    const s = String(str).trim();
    if (s.indexOf('T') !== -1) {
        const t = s.split('T')[1];
        if (!t) return null;
        const parts = t.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
    }
    const match = s.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return parseInt(match[1]) * 60 + parseInt(match[2]);
}

window.getCurrentRadioProgram = (programas) => {
    if (!Array.isArray(programas) || programas.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const active = programas.filter(p => String(p.ativo).toLowerCase() !== 'false');

    for (const p of active) {
        const ini = parseTimeToMinutes(p.inicio);
        const fim = parseTimeToMinutes(p.fim);
        if (ini === null || fim === null) continue;

        if (fim > ini) {
            if (currentMinutes >= ini && currentMinutes < fim) return p;
        } else {
            if (currentMinutes >= ini || currentMinutes < fim) return p;
        }
    }
    return null;
};

// ============================================================
// RENDERIZAR PÁGINA
// ============================================================
window.renderRadioPage = async () => {
    if (!window.__radioState.carregado) {
        try {
            const [programas, liveConfig] = await Promise.all([
                window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=radio', 'cache_radio_v2', true),
                window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=config_radio', 'cache_config_radio_v2', true)
            ]);

            window.__radioState.programas = Array.isArray(programas) ? programas : [];
            window.__radioState.liveConfig = (Array.isArray(liveConfig) && liveConfig[0]) ? liveConfig[0] : { facebookLiveUrl: '', isLive: 'false' };
            window.__radioState.carregado = true;
        } catch (e) {
            console.error('Erro ao carregar dados da rádio:', e);
            window.__radioState.carregado = true;
        }
    }

    window.renderRadioContent();
};

window.renderRadioContent = () => {
    const state = window.__radioState;
    const programasArr = state.programas;
    const liveCfg = state.liveConfig;
    const isLive = String(liveCfg.isLive).toLowerCase() === 'true' && liveCfg.facebookLiveUrl;

    const currentProgram = window.getCurrentRadioProgram(programasArr);
    state.currentProgram = currentProgram;

    // ---------------------------------------------
    // 1. Badge no topo
    // ---------------------------------------------
    const statusLabelEl = document.getElementById('radio-status-label');
    if (statusLabelEl) {
        if (isLive) statusLabelEl.textContent = 'Transmissão ao Vivo';
        else if (currentProgram) statusLabelEl.textContent = 'No Ar: ' + (currentProgram.programa || 'Programa');
        else statusLabelEl.textContent = 'No Ar Agora';
    }

    // ---------------------------------------------
    // 2. Player (Facebook OU Rádio OU card offline)
    // ✅ CORREÇÃO: botão "Ouvir Rádio" + botão "Voltar pra Live"
    // ---------------------------------------------
    const playerContent = document.getElementById('radio-player-content');
    if (playerContent) {
        if (isLive && !state.userChoseRadio) {
            // Está ao vivo E usuário NÃO escolheu ouvir rádio → Facebook
            const raw = String(liveCfg.facebookLiveUrl).trim();
            let fbHtml = '';

            if (raw.indexOf('<iframe') !== -1) {
                fbHtml = raw;
            } else if (raw.indexOf('http') === 0) {
                const fbUrl = encodeURIComponent(raw);
                fbHtml =
                    '<iframe ' +
                        'src="https://www.facebook.com/plugins/video.php?href=' + fbUrl + '&show_text=false&width=560&height=315" ' +
                        'style="border:0; position:absolute; top:0; left:0; width:100%; height:100%;" ' +
                        'scrolling="no" frameborder="0" ' +
                        'allowfullscreen="true" ' +
                        'allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">' +
                    '</iframe>';
            }

            playerContent.innerHTML =
                fbHtml +
                '<button id="radio-toggle-live-btn" class="radio-toggle-live-btn" onclick="window.toggleRadioPlayer()">' +
                    '<i class="fas fa-radio"></i> Ouvir somente a Rádio' +
                '</button>';
        } else if (isLive && state.userChoseRadio) {
            // Está ao vivo, mas usuário escolheu ouvir rádio → player da rádio
            playerContent.innerHTML =
                '<div class="radio-audio-player">' +
                    '<div class="radio-audio-icon"><i class="fas fa-broadcast-tower"></i></div>' +
                    '<h3 class="radio-audio-title">Rádio Nazareno FM</h3>' +
                    '<p class="radio-audio-text">Você está ouvindo apenas a rádio. A transmissão ao vivo continua disponível.</p>' +
                    '<a href="https://nazarenofm.com" target="_blank" rel="noopener" class="radio-audio-play-btn">' +
                        '<i class="fas fa-play"></i> Abrir Player da Rádio' +
                    '</a>' +
                    '<button class="radio-toggle-live-btn" onclick="window.toggleRadioPlayer()">' +
                        '<i class="fas fa-tv"></i> Voltar para a Transmissão ao Vivo' +
                    '</button>' +
                '</div>';
        } else {
            // Não está ao vivo → card offline
            playerContent.innerHTML =
                '<div class="radio-offline-card">' +
                    '<div class="radio-offline-icon"><i class="fas fa-broadcast-tower"></i></div>' +
                    '<h3 class="radio-offline-title">A Rádio está fora do ar</h3>' +
                    '<p class="radio-offline-text">Nenhuma transmissão no momento. Confira a programação abaixo ou abra o Facebook da rádio.</p>' +
                    '<div class="radio-offline-buttons">' +
                        '<a href="https://www.facebook.com/nazarenofm107.9" target="_blank" rel="noopener" class="radio-offline-btn radio-offline-btn-facebook">' +
                            '<i class="fab fa-facebook-f"></i> Abrir Facebook da Rádio' +
                        '</a>' +
                        '<a href="https://nazarenofm.com" target="_blank" rel="noopener" class="radio-offline-btn radio-offline-btn-site">' +
                            '<i class="fas fa-globe"></i> Acessar nazarenofm.com' +
                        '</a>' +
                    '</div>' +
                '</div>';
        }
    }

    // ---------------------------------------------
    // 3. WhatsApp
    // ---------------------------------------------
    const whatsappBtn = document.getElementById('radio-whatsapp-btn');
    const whatsappLabel = document.getElementById('radio-whatsapp-label');

    if (whatsappBtn && whatsappLabel) {
        if (currentProgram && currentProgram.whatsapp) {
            const num = String(currentProgram.whatsapp).replace(/\D/g, '');
            whatsappBtn.href = 'https://wa.me/55' + num + '?text=' + encodeURIComponent('Olá! Gostaria de pedir um louvor.');
            whatsappLabel.textContent = 'Pedir louvor para ' + (currentProgram.programa || 'a rádio');
        } else {
            whatsappBtn.href = 'https://wa.me/5565992977124';
            whatsappLabel.textContent = 'via WhatsApp';
        }
    }

    // ---------------------------------------------
    // 4. Grade em 2 colunas
    // ---------------------------------------------
    window.renderRadioGrid(currentProgram);
};

// ============================================================
// RENDERIZAR GRADE
// ============================================================
window.renderRadioGrid = (currentProgram) => {
    const container = document.getElementById('radio-grid-container');
    const colLeft = document.getElementById('radio-grid-left');
    const colRight = document.getElementById('radio-grid-right');
    const highlight = document.getElementById('radio-now-highlight');
    if (!container || !colLeft || !colRight) return;

    const programas = (window.__radioState.programas || [])
        .filter(p => String(p.ativo).toLowerCase() !== 'false')
        .sort((a, b) => {
            const ai = parseTimeToMinutes(a.inicio);
            const bi = parseTimeToMinutes(b.inicio);
            return (ai === null ? 9999 : ai) - (bi === null ? 9999 : bi);
        });

    if (programas.length < 2) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');

    const metade = Math.ceil(programas.length / 2);
    const esquerda = programas.slice(0, metade);
    const direita = programas.slice(metade);

    const renderItem = (p) => {
        const isCurrent = currentProgram && p.id && currentProgram.id && p.id === currentProgram.id;
        const hora = formatHora(p.inicio) + ' — ' + formatHora(p.fim);

        return '<div class="radio-schedule-item ' + (isCurrent ? 'radio-schedule-item-active' : '') + '">' +
                    '<div class="radio-schedule-time">' +
                        '<i class="far fa-clock"></i><span>' + hora + '</span>' +
                    '</div>' +
                    '<div class="radio-schedule-body">' +
                        '<div class="radio-schedule-name">' + (p.programa || 'Programa') + '</div>' +
                        (isCurrent ? '<div class="radio-schedule-now-badge"><span class="radio-schedule-now-dot"></span>NO AR AGORA</div>' : '') +
                    '</div>' +
                    (isCurrent ? '<div class="radio-schedule-pulse"></div>' : '') +
                '</div>';
    };

    colLeft.innerHTML = esquerda.map(renderItem).join('');
    colRight.innerHTML = direita.map(renderItem).join('');

    if (highlight) {
        if (currentProgram) {
            highlight.classList.remove('hidden');
            highlight.innerHTML =
                '<div class="radio-now-highlight-card">' +
                    '<div class="radio-now-highlight-glow"></div>' +
                    '<div class="radio-now-highlight-inner">' +
                        '<div class="radio-now-highlight-badge"><span class="radio-now-highlight-dot"></span>NO AR AGORA</div>' +
                        '<h3 class="radio-now-highlight-title">' + (currentProgram.programa || 'Programa') + '</h3>' +
                        '<p class="radio-now-highlight-time"><i class="far fa-clock"></i>' + formatHora(currentProgram.inicio) + ' — ' + formatHora(currentProgram.fim) + '</p>' +
                        (currentProgram.whatsapp ?
                            '<a href="https://wa.me/55' + String(currentProgram.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent('Olá! Gostaria de pedir um louvor.') + '" target="_blank" class="radio-now-highlight-btn">' +
                                '<i class="fab fa-whatsapp"></i> Pedir Louvor' +
                            '</a>'
                            : '') +
                    '</div>' +
                '</div>';
        } else {
            highlight.classList.add('hidden');
            highlight.innerHTML = '';
        }
    }
};

// ============================================================
// TOGGLE
// ============================================================
window.toggleRadioPlayer = () => {
    window.__radioState.userChoseRadio = !window.__radioState.userChoseRadio;
    window.renderRadioContent();
};

// ============================================================
// ATUALIZAÇÃO A CADA 60s
// ============================================================
setInterval(() => {
    const radioPage = document.getElementById('radio-page');
    if (radioPage && !radioPage.classList.contains('hidden')) {
        const novo = window.getCurrentRadioProgram(window.__radioState.programas);
        const atual = window.__radioState.currentProgram;
        const mudou = (!atual && novo) || (atual && !novo) || (atual && novo && atual.id !== novo.id);
        if (mudou) window.renderRadioContent();
    }
}, 60000);

// ============================================================
// ESCUTA MUDANÇAS DO ADMIN
// ============================================================
window.addEventListener('storage', (event) => {
    if (event && event.key === '__iead_data_changed') {
        window.__radioState.carregado = false;
        const radioPage = document.getElementById('radio-page');
        if (radioPage && !radioPage.classList.contains('hidden')) window.renderRadioPage();
    }
});

// ============================================================
// AUTO-INICIALIZA
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const radioPage = document.getElementById('radio-page');
        if (radioPage && !radioPage.classList.contains('hidden')) window.renderRadioPage();
    }, 500);
});

console.log('📻 radio.js carregado');
