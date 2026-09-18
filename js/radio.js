// ============================================================
// IEAD NOVA ALIANÇA - RÁDIO
// ============================================================

window.__radioState = {
    programas: [],
    liveConfig: { facebookLiveUrl: '', isLive: 'false' },
    currentProgram: null,
    diaSelecionado: null,
    userChoseRadio: false,
    carregado: false,
    __modoPlayerRenderizado: ''
};

// ============================================================
// DIAS DA SEMANA
// ============================================================
const DIAS_SEMANA = [
    { key: 'dom', short: 'Dom', full: 'Domingo' },
    { key: 'seg', short: 'Seg', full: 'Segunda' },
    { key: 'ter', short: 'Ter', full: 'Terça' },
    { key: 'qua', short: 'Qua', full: 'Quarta' },
    { key: 'qui', short: 'Qui', full: 'Quinta' },
    { key: 'sex', short: 'Sex', full: 'Sexta' },
    { key: 'sab', short: 'Sáb', full: 'Sábado' }
];

function getDiaHojeKey() {
    return DIAS_SEMANA[new Date().getDay()].key;
}

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

function programaPassaNoDia(dias, diaKey) {
    if (!dias || String(dias).trim() === '' || String(dias).toLowerCase().trim() === 'todos') {
        return true;
    }

    const lista = String(dias)
        .toLowerCase()
        .replace(/\s/g, '')
        .replace(/sáb/g, 'sab')
        .split(',')
        .filter(d => d);

    return lista.indexOf(diaKey) !== -1;
}

window.getCurrentRadioProgram = (programas) => {
    if (!Array.isArray(programas) || programas.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const hoje = getDiaHojeKey();
    const active = programas.filter(p => String(p.ativo).toLowerCase() !== 'false');

    for (const p of active) {
        if (!programaPassaNoDia(p.dias, hoje)) continue;

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

    if (!window.__radioState.diaSelecionado) {
        window.__radioState.diaSelecionado = getDiaHojeKey();
    }

    window.renderRadioContent();
};

// ============================================================
// ✅ RENDERIZAR CONTEÚDO
// - Só re-renderiza o PLAYER se o modo mudou (Live ↔ Rádio)
// - Clicar no dia NÃO reinicia o player
// ============================================================
window.renderRadioContent = () => {
    const state = window.__radioState;
    const programasArr = state.programas;
    const liveCfg = state.liveConfig;
    const isLive = String(liveCfg.isLive).toLowerCase() === 'true' && liveCfg.facebookLiveUrl;
    const showFacebook = isLive && !state.userChoseRadio;

    const currentProgram = window.getCurrentRadioProgram(programasArr);
    state.currentProgram = currentProgram;

    // Badge no topo
    const statusLabelEl = document.getElementById('radio-status-label');
    if (statusLabelEl) {
        if (isLive) statusLabelEl.textContent = 'Transmissão ao Vivo';
        else if (currentProgram) statusLabelEl.textContent = 'No Ar: ' + (currentProgram.programa || 'Programa');
        else statusLabelEl.textContent = 'No Ar Agora';
    }

    // ✅ PLAYER — só re-renderiza se o modo mudou
    const modoAtual = showFacebook ? 'facebook' : 'radio';
    const modoAnterior = state.__modoPlayerRenderizado || '';
    const playerContent = document.getElementById('radio-player-content');

    if (modoAnterior !== modoAtual && playerContent) {
        if (showFacebook) {
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

            playerContent.innerHTML = fbHtml;
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

        state.__modoPlayerRenderizado = modoAtual;
    }

    // ✅ Botão de alternância — remove o antigo e adiciona o novo
    if (playerContent) {
        const oldBtn = playerContent.querySelector('.radio-toggle-live-btn');
        if (oldBtn) oldBtn.remove();

        if (isLive) {
            const btn = document.createElement('button');
            btn.className = 'radio-toggle-live-btn';
            btn.onclick = window.toggleRadioPlayer;
            if (showFacebook) {
                btn.innerHTML = '<i class="fas fa-radio"></i> Ouvir somente a Rádio';
            } else {
                btn.innerHTML = '<i class="fas fa-tv"></i> Voltar para a Transmissão ao Vivo';
            }
            playerContent.appendChild(btn);
        }
    }

    // ✅ WhatsApp — usa textoBotao personalizado, com fallback pro nome do programa
    const whatsappBtn = document.getElementById('radio-whatsapp-btn');
    const whatsappLabel = document.getElementById('radio-whatsapp-label');

    if (whatsappBtn && whatsappLabel) {
        if (currentProgram && currentProgram.whatsapp) {
            const num = String(currentProgram.whatsapp).replace(/\D/g, '');
            const textoCustom = currentProgram.textoBotao && String(currentProgram.textoBotao).trim();
            const textoFinal = textoCustom
                ? String(currentProgram.textoBotao).trim()
                : 'Pedir louvor para ' + (currentProgram.programa || 'a rádio');

            whatsappBtn.href = 'https://wa.me/55' + num + '?text=' + encodeURIComponent('Olá! Gostaria de pedir um louvor.');
            whatsappLabel.textContent = textoFinal;
        } else {
            whatsappBtn.href = 'https://wa.me/5565992977124';
            whatsappLabel.textContent = 'via WhatsApp';
        }
    }

    // Grade (abas + lista)
    window.renderRadioDayTabs();
    window.renderRadioGridForDay(state.diaSelecionado, currentProgram);
};

// ============================================================
// RENDERIZAR ABAS DE DIAS
// ============================================================
window.renderRadioDayTabs = () => {
    const container = document.getElementById('radio-days-tabs');
    if (!container) return;

    const state = window.__radioState;
    const diaHoje = getDiaHojeKey();

    container.innerHTML = DIAS_SEMANA.map(d => {
        const isSelected = d.key === state.diaSelecionado;
        const isHoje = d.key === diaHoje;
        return '<button ' +
                    'class="radio-day-tab ' + (isSelected ? 'radio-day-tab-active' : '') + ' ' + (isHoje ? 'radio-day-tab-hoje' : '') + '" ' +
                    'onclick="window.selectRadioDay(\'' + d.key + '\')" ' +
                '>' +
                    '<span class="radio-day-tab-short">' + d.short + '</span>' +
                    (isHoje ? '<span class="radio-day-tab-hoje-dot"></span>' : '') +
                '</button>';
    }).join('');
};

// ============================================================
// ✅ SELECIONAR DIA — só re-renderiza a GRADE, não o player
// ============================================================
window.selectRadioDay = (diaKey) => {
    const state = window.__radioState;
    state.diaSelecionado = diaKey;

    window.renderRadioDayTabs();
    window.renderRadioGridForDay(diaKey, state.currentProgram);
};

// ============================================================
// RENDERIZAR GRADE DO DIA SELECIONADO
// ============================================================
window.renderRadioGridForDay = (diaKey, currentProgram) => {
    const container = document.getElementById('radio-grid-container');
    const gridList = document.getElementById('radio-grid-list');
    const emptyMsg = document.getElementById('radio-grid-empty');
    const titleEl = document.getElementById('radio-grid-title');
    const highlight = document.getElementById('radio-now-highlight');

    if (!container || !gridList) return;

    const diaInfo = DIAS_SEMANA.find(d => d.key === diaKey);
    if (titleEl && diaInfo) {
        const diaHoje = getDiaHojeKey();
        titleEl.innerHTML = '📅 ' + diaInfo.full + (diaKey === diaHoje ? ' <span class="radio-grid-today">(hoje)</span>' : '');
    }

    const programas = (window.__radioState.programas || [])
        .filter(p => String(p.ativo).toLowerCase() !== 'false')
        .filter(p => programaPassaNoDia(p.dias, diaKey))
        .sort((a, b) => {
            const ai = parseTimeToMinutes(a.inicio);
            const bi = parseTimeToMinutes(b.inicio);
            return (ai === null ? 9999 : ai) - (bi === null ? 9999 : bi);
        });

    if (programas.length === 0) {
        container.classList.remove('hidden');
        gridList.innerHTML = '';
        if (emptyMsg) emptyMsg.classList.remove('hidden');
        if (highlight) {
            highlight.classList.add('hidden');
            highlight.innerHTML = '';
        }
        return;
    }

    container.classList.remove('hidden');
    if (emptyMsg) emptyMsg.classList.add('hidden');

    const renderItem = (p) => {
        const isCurrent = currentProgram && p.id && currentProgram.id && p.id === currentProgram.id;
        const hora = formatHora(p.inicio) + ' — ' + formatHora(p.fim);

        return '<div class="radio-schedule-item ' + (isCurrent ? 'radio-schedule-item-active' : '') + '">' +
                    '<div class="radio-schedule-time">' +
                        '<i class="far fa-clock"></i><span>' + hora + '</span>' +
                    '</div>' +
                    '<div class="radio-schedule-body">' +
                        '<div class="radio-schedule-name">' + (p.programa || 'Programa') + '</div>' +
                        (isCurrent ? '<div class="radio-schedule-now-badge"><span class="radio-schedule-now-dot"></span>AO VIVO</div>' : '') +
                    '</div>' +
                    (isCurrent ? '<div class="radio-schedule-pulse"></div>' : '') +
                '</div>';
    };

    gridList.innerHTML = programas.map(renderItem).join('');

    if (highlight) {
        const currentIsInSelectedDay = currentProgram && programaPassaNoDia(currentProgram.dias, diaKey);

        if (currentIsInSelectedDay) {
            // ✅ Texto do botão no destaque — usa textoBotao personalizado
            const textoBotaoDestaque = (currentProgram.textoBotao && String(currentProgram.textoBotao).trim())
                ? String(currentProgram.textoBotao).trim()
                : 'Pedir Louvor';

            highlight.classList.remove('hidden');
            highlight.innerHTML =
                '<div class="radio-now-highlight-card">' +
                    '<div class="radio-now-highlight-glow"></div>' +
                    '<div class="radio-now-highlight-inner">' +
                        '<div class="radio-now-highlight-badge"><span class="radio-now-highlight-dot"></span>AO VIVO AGORA</div>' +
                        '<h3 class="radio-now-highlight-title">' + (currentProgram.programa || 'Programa') + '</h3>' +
                        '<p class="radio-now-highlight-time"><i class="far fa-clock"></i>' + formatHora(currentProgram.inicio) + ' — ' + formatHora(currentProgram.fim) + '</p>' +
                        (currentProgram.whatsapp ?
                            '<a href="https://wa.me/55' + String(currentProgram.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent('Olá! Gostaria de pedir um louvor.') + '" target="_blank" class="radio-now-highlight-btn">' +
                                '<i class="fab fa-whatsapp"></i> ' + textoBotaoDestaque +
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
// ✅ TOGGLE — força re-render do player (porque o modo mudou)
// ============================================================
window.toggleRadioPlayer = () => {
    const state = window.__radioState;
    state.userChoseRadio = !state.userChoseRadio;

    state.__modoPlayerRenderizado = '';

    window.renderRadioContent();
};

// ============================================================
// ATUALIZAÇÃO A CADA 60s (detecta mudança de programa)
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
        window.__radioState.__modoPlayerRenderizado = '';
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
