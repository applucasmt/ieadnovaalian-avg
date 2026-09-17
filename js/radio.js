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
    // 1. Tag "Programa no ar" (SUBSTITUI a lista)
    // ---------------------------------------------
    const statusLabelEl = document.getElementById('radio-status-label');
    if (statusLabelEl) {
        if (isLive) {
            statusLabelEl.textContent = 'Transmissão ao Vivo';
        } else if (currentProgram) {
            statusLabelEl.textContent = 'No Ar: ' + (currentProgram.programa || 'Programa');
        } else {
            statusLabelEl.textContent = 'No Ar Agora';
        }
    }

    // ---------------------------------------------
    // 2. Programa atual (linha abaixo do título)
    // ---------------------------------------------
    const programInfoEl = document.getElementById('radio-program-info');
    const programNameEl = document.getElementById('radio-program-name');
    const programTimeEl = document.getElementById('radio-program-time');

    if (currentProgram) {
        if (programNameEl) programNameEl.textContent = currentProgram.programa || 'Programa';
        if (programTimeEl) programTimeEl.textContent = formatHora(currentProgram.inicio) + ' — ' + formatHora(currentProgram.fim);
        if (programInfoEl) programInfoEl.classList.remove('hidden');
    } else {
        if (programInfoEl) programInfoEl.classList.add('hidden');
    }

    // ---------------------------------------------
    // 3. Player (Facebook ou rádio)
    // ---------------------------------------------
    const playerContent = document.getElementById('radio-player-content');
    if (playerContent) {
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
    // 4. Toggle (só quando ao vivo)
    // ---------------------------------------------
    const toggleWrapper = document.getElementById('radio-toggle-wrapper');
    const toggleText = document.getElementById('radio-toggle-text');

    if (toggleWrapper) {
        if (isLive) {
            toggleWrapper.classList.remove('hidden');
            if (toggleText) toggleText.textContent = state.userChoseRadio ? 'Assistir Transmissão ao Vivo' : 'Ouvir somente a Rádio';
        } else {
            toggleWrapper.classList.add('hidden');
        }
    }

    // ---------------------------------------------
    // 5. WhatsApp
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
        if (mudou) {
            console.log('📻 Programa mudou. Atualizando...');
            window.renderRadioContent();
        }
    }
}, 60000);

// ============================================================
// ESCUTA MUDANÇAS DO ADMIN
// ============================================================
window.addEventListener('storage', (event) => {
    if (event && event.key === '__iead_data_changed') {
        window.__radioState.carregado = false;
        const radioPage = document.getElementById('radio-page');
        if (radioPage && !radioPage.classList.contains('hidden')) {
            window.renderRadioPage();
        }
    }
});

console.log('📻 radio.js carregado');
