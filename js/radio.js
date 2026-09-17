// ============================================================
// IEAD NOVA ALIANÇA - RÁDIO
// ============================================================

// ============================================================
// ESTADO GLOBAL
// ============================================================
window.__radioState = {
    programas: [],
    liveConfig: { facebookLiveUrl: '', isLive: 'false' },
    currentProgram: null,
    showingLive: false, // true = mostrando Facebook; false = mostrando rádio
    carregado: false
};

// ============================================================
// HELPERS
// ============================================================
function parseTimeToMinutes(str) {
    if (!str) return null;
    const match = String(str).trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
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
// RENDERIZAR PÁGINA DA RÁDIO
// ============================================================
window.renderRadioPage = async () => {
    if (!window.__radioState.carregado) {
        // Primeira vez: busca os dados
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

// ============================================================
// RENDERIZAR CONTEÚDO (preenche os IDs específicos)
// ============================================================
window.renderRadioContent = () => {
    const state = window.__radioState;
    const programasArr = state.programas;
    const liveCfg = state.liveConfig;
    const isLive = String(liveCfg.isLive).toLowerCase() === 'true' && liveCfg.facebookLiveUrl;

    // ---------------------------------------------
    // 1. Programa atual
    // ---------------------------------------------
    const currentProgram = window.getCurrentRadioProgram(programasArr);
    state.currentProgram = currentProgram;

    const programInfoEl = document.getElementById('radio-program-info');
    const programNameEl = document.getElementById('radio-program-name');
    const programTimeEl = document.getElementById('radio-program-time');
    const statusLabelEl = document.getElementById('radio-status-label');

    if (currentProgram) {
        if (programNameEl) programNameEl.textContent = currentProgram.programa || 'Programa';
        if (programTimeEl) programTimeEl.textContent = (currentProgram.inicio || '?') + ' — ' + (currentProgram.fim || '?');
        if (programInfoEl) programInfoEl.classList.remove('hidden');
    } else {
        if (programInfoEl) programInfoEl.classList.add('hidden');
    }

    if (statusLabelEl) {
        statusLabelEl.textContent = isLive ? 'Transmissão ao Vivo' : 'No Ar Agora';
    }

    // ---------------------------------------------
    // 2. Player (rádio ou Facebook)
    // ---------------------------------------------
    const playerContent = document.getElementById('radio-player-content');
    if (playerContent) {
        // Decide o que mostrar:
        // - Se estiver ao vivo E o usuário NÃO clicou em "ouvir rádio" → Facebook
        // - Senão → rádio online
        const shouldShowFacebook = isLive && !state.userChoseRadio;

        if (shouldShowFacebook) {
            const fbUrl = encodeURIComponent(liveCfg.facebookLiveUrl);
            playerContent.innerHTML =
                '<iframe ' +
                    'src="https://www.facebook.com/plugins/video.php?href=' + fbUrl + '&show_text=false&width=560&height=315" ' +
                    'style="border:0; position:absolute; top:0; left:0; width:100%; height:100%;" ' +
                    'scrolling="no" frameborder="0" ' +
                    'allowfullscreen="true" ' +
                    'allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">' +
                '</iframe>';
        } else {
            playerContent.innerHTML =
                '<iframe ' +
                    'id="radio-iframe" ' +
                    'src="https://nazarenofm.com/" ' +
                    'title="Rádio Nazareno FM" ' +
                    'style="border:0; position:absolute; top:0; left:0; width:100%; height:100%;" ' +
                    'allow="autoplay">' +
                '</iframe>';
        }
    }

    // ---------------------------------------------
    // 3. Botão de alternância (só quando ao vivo)
    // ---------------------------------------------
    const toggleWrapper = document.getElementById('radio-toggle-wrapper');
    const toggleText = document.getElementById('radio-toggle-text');

    if (toggleWrapper) {
        if (isLive) {
            toggleWrapper.classList.remove('hidden');
            if (toggleText) {
                toggleText.textContent = state.userChoseRadio ? 'Assistir Transmissão ao Vivo' : 'Ouvir somente a Rádio';
            }
        } else {
            toggleWrapper.classList.add('hidden');
        }
    }

    // ---------------------------------------------
    // 4. WhatsApp (número do programa atual)
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
    // 5. Grade de programação
    // ---------------------------------------------
    const gradeContainer = document.getElementById('radio-grade-container');
    const gradeList = document.getElementById('radio-grade-list');

    if (gradeContainer && gradeList) {
        const sorted = [...programasArr]
            .filter(p => String(p.ativo).toLowerCase() !== 'false')
            .sort((a, b) => {
                const ai = parseTimeToMinutes(a.inicio) || 0;
                const bi = parseTimeToMinutes(b.inicio) || 0;
                return ai - bi;
            });

        if (sorted.length > 0) {
            gradeContainer.classList.remove('hidden');
            gradeList.innerHTML = sorted.map(p => {
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
            }).join('');
        } else {
            gradeContainer.classList.add('hidden');
        }
    }
};

// ============================================================
// TOGGLE PLAYER (Live ↔ Rádio)
// ============================================================
window.toggleRadioPlayer = () => {
    window.__radioState.userChoseRadio = !window.__radioState.userChoseRadio;
    window.renderRadioContent();
};

// ============================================================
// ATUALIZAR A CADA MINUTO (detecta mudança de programa)
// ============================================================
let __radioUpdateTimer = null;
function iniciarAtualizacaoRadio() {
    if (__radioUpdateTimer) clearInterval(__radioUpdateTimer);
    __radioUpdateTimer = setInterval(() => {
        // Só re-renderiza se a página da rádio estiver visível
        const radioPage = document.getElementById('radio-page');
        if (radioPage && !radioPage.classList.contains('hidden')) {
            // Re-checa se ainda é o mesmo programa
            const novo = window.getCurrentRadioProgram(window.__radioState.programas);
            const atual = window.__radioState.currentProgram;
            const mudou = (!atual && novo) || (atual && !novo) || (atual && novo && atual.id !== novo.id);

            if (mudou) {
                console.log('📻 Programa mudou. Atualizando...');
                window.renderRadioContent();
            }
        }
    }, 60000); // a cada 60 segundos
}

// Inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    iniciarAtualizacaoRadio();
});

// ============================================================
// ESCUTA MUDANÇAS DO ADMIN (broadcast)
// ============================================================
window.addEventListener('storage', (event) => {
    if (event && event.key === '__iead_data_changed') {
        // Invalida o cache da rádio e re-renderiza se a página estiver visível
        window.__radioState.carregado = false;
        const radioPage = document.getElementById('radio-page');
        if (radioPage && !radioPage.classList.contains('hidden')) {
            window.renderRadioPage();
        }
    }
});

console.log('📻 radio.js carregado');
