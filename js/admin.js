// ============================================================
// IEAD NOVA ALIANÇA - PAINEL ADMIN
// ============================================================

window.SCHEMAS = {
    eventos: [
        { key: 'name', label: 'Nome do Evento', type: 'text' },
        { key: 'date', label: 'Data Início', type: 'datetime-local' },
        { key: 'endDate', label: 'Data Fim (Opcional)', type: 'datetime-local' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'coverUrl', label: 'URL da Capa', type: 'text', upload: true }
    ],

    avisos: [
        { key: 'title', label: '📝 Título do Aviso', type: 'text', required: true },
        { key: 'subtitle', label: 'Subtítulo', type: 'text' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'imageUrl', label: '🖼️ URL da Imagem de Fundo', type: 'text', hint: 'Deixe vazio para usar só cor de fundo', upload: true },
        { key: 'bgColor', label: '🎨 Cor de Fundo', type: 'color', default: '#0f172a' },
        { key: 'textColor', label: '🎨 Cor do Texto', type: 'color', default: '#ffffff' },
        { key: 'buttonText', label: '🔘 Texto do Botão', type: 'text' },
        { key: 'buttonUrl', label: '🔗 Link do Botão', type: 'text' },
        { key: 'position', label: '📍 Posição do Conteúdo', type: 'select', options: ['left', 'center', 'right', 'custom'], default: 'center' },
        { key: 'align', label: '↔️ Alinhamento', type: 'select', options: ['left', 'center', 'right'], default: 'center' },
        { key: 'posX', label: '📍 Posição X %', type: 'number', default: 50 },
        { key: 'posY', label: '📍 Posição Y %', type: 'number', default: 50 },
        { key: 'order', label: '🔢 Ordem', type: 'number', default: 1 },
        { key: 'active', label: '✅ Ativo?', type: 'select', options: ['true', 'false'], default: 'true' }
    ],

    ministerios: [
        { key: 'nome', label: 'Nome do Ministério', type: 'text' },
        { key: 'lideres', label: 'Líderes', type: 'text' },
        { key: 'regentes', label: 'Regentes', type: 'text' },
        { key: 'telefone', label: 'Whatsapp', type: 'text' },
        { key: 'capa', label: 'URL da Foto', type: 'text', upload: true }
    ],

    talentos: [
        { key: 'nome', label: 'Nome', type: 'text' },
        { key: 'descricao', label: 'Descrição', type: 'textarea' },
        { key: 'telefone', label: 'Whatsapp', type: 'text' },
        { key: 'video', label: 'Link YouTube', type: 'text' },
        { key: 'videoFormat', label: '📐 Formato do Vídeo', type: 'select', options: ['auto', 'horizontal', 'vertical'], default: 'auto', hint: 'Escolha "vertical" para Shorts, "horizontal" para vídeos normais, ou "auto" para detectar.' },
        { key: 'capa', label: 'URL da Foto', type: 'text', upload: true }
    ],

    radio: [
        { key: 'programa', label: '📻 Nome do Programa', type: 'text' },
        { key: 'inicio', label: '⏰ Horário de Início', type: 'time' },
        { key: 'fim', label: '⏰ Horário de Fim', type: 'time' },
        { key: 'dias', label: '📅 Dias da Semana', type: 'text', hint: 'Use: todos | seg,ter,qua,qui,sex | sab,dom | seg,qua,sex. Separe por vírgula.' },
        { key: 'whatsapp', label: '📱 WhatsApp do Locutor', type: 'text', hint: 'Só números: 65999991111' },
        { key: 'textoBotao', label: '💬 Texto do Botão WhatsApp', type: 'text', hint: 'Deixe vazio para usar "Pedir louvor para [nome do programa]". Ex: "Pedir música", "Mande seu pedido", etc.' },
        { key: 'ativo', label: '✅ Ativo?', type: 'select', options: ['true', 'false'], default: 'true' }
    ],

    // ✅ ÁLBUM: só nome e link. Fotos e capa são gerenciadas no modal.
    albuns: [
        { key: 'albumName', label: 'Nome do Álbum', type: 'text' },
        { key: 'albumUrl', label: 'Link externo (opcional — só se você quiser usar um link em vez das fotos)', type: 'text' }
    ],

    pastor: [
        { key: 'nome', label: 'Nome', type: 'text' },
        { key: 'capa', label: 'URL da Foto', type: 'text', upload: true }
    ]
};

window.heroState = {
    position: 'center', align: 'center',
    posX: 50, posY: 50,
    title: '', subtitle: '', description: ''
};

window.isImageField = (key) => {
    return ['coverUrl', 'capa', 'coverImageUrl', 'imageUrl'].indexOf(key) !== -1;
};

window.notifyDataChanged = () => {
    if (typeof window.loadData === 'function') window.loadData(true);
    if (typeof window.broadcastDataChanged === 'function') window.broadcastDataChanged();
};

// ============================================================
// ✅ COMPRESSÃO EM 2 ETAPAS (720px → 480px se falhar)
// ============================================================
window.compressImageToWebP = (file, maxWidth, quality) => {
    maxWidth = maxWidth || 720;
    quality = quality || 0.82;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                if (w > maxWidth) {
                    h = Math.round((h * maxWidth) / w);
                    w = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) { reject(new Error('Falha ao converter')); return; }
                        const fr = new FileReader();
                        fr.onload = () => {
                            const base64 = String(fr.result).split(',')[1];
                            resolve({ base64: base64, mimeType: 'image/webp', width: w, height: h, size: blob.size });
                        };
                        fr.onerror = () => reject(new Error('Erro lendo blob'));
                        fr.readAsDataURL(blob);
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Erro carregando imagem'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Erro lendo arquivo'));
        reader.readAsDataURL(file);
    });
};

// ============================================================
// ✅ UPLOAD COM RETRY AUTOMÁTICO
// ============================================================
window.uploadCompressedPhoto = async (file) => {
    let attempt = 0;
    const maxAttempts = 2;
    let lastError = '';

    while (attempt < maxAttempts) {
        attempt++;
        try {
            const maxWidth = attempt === 1 ? 720 : 480;
            const quality = attempt === 1 ? 0.82 : 0.70;

            const compressed = await window.compressImageToWebP(file, maxWidth, quality);
            const sizeMB = compressed.size / 1024 / 1024;
            console.log('📸 ' + file.name + ' → ' + compressed.width + 'x' + compressed.height + ' · ' + sizeMB.toFixed(2) + ' MB');

            if (sizeMB > 8) {
                if (attempt < maxAttempts) continue;
                return { success: false, message: 'Imagem muito grande (' + sizeMB.toFixed(1) + ' MB).' };
            }

            const payload = {
                action: 'uploadImage',
                password: window.adminState.password,
                fileName: (file.name || 'foto').replace(/\.[^/.]+$/, '') + '.webp',
                mimeType: 'image/webp',
                imageBase64: compressed.base64
            };

            const res = await fetch(window.CONFIG.scriptUrl, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (window.handleServerAuthError(result)) {
                return { success: false, message: 'Sessão expirada.' };
            }

            if (!result.success) {
                lastError = result.message || 'Erro no upload.';
                if (attempt < maxAttempts) continue;
                return { success: false, message: lastError };
            }

            return { success: true, url: result.url, thumbUrl: result.thumbUrl, deleteUrl: result.deleteUrl };

        } catch (e) {
            lastError = e.message;
            if (attempt < maxAttempts) continue;
            return { success: false, message: 'Erro: ' + e.message };
        }
    }

    return { success: false, message: lastError || 'Erro desconhecido.' };
};

// ============================================================
// ABRIR / FECHAR ADMIN
// ============================================================
window.openAdmin = () => {
    const modal = document.getElementById('admin-modal');
    const login = document.getElementById('admin-login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    const errorMsg = document.getElementById('admin-login-error');

    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);

    if (window.adminState.isAuthenticated) {
        login.classList.add('hidden');
        dashboard.classList.remove('hidden');
        window.loadAdminTab('eventos');
    } else {
        login.classList.remove('hidden');
        dashboard.classList.add('hidden');
        document.getElementById('admin-password').value = '';
        if (errorMsg) errorMsg.classList.add('hidden');
    }
};

window.closeAdmin = () => {
    const modal = document.getElementById('admin-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
};

// ============================================================
// LOGIN
// ============================================================
window.adminLogin = () => {
    const input = document.getElementById('admin-password');
    const errorMsg = document.getElementById('admin-login-error');
    const btn = document.getElementById('admin-login-btn');
    const pass = input.value;

    if (errorMsg) errorMsg.classList.add('hidden');

    if (!pass) {
        if (errorMsg) { errorMsg.textContent = 'Digite a senha.'; errorMsg.classList.remove('hidden'); }
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';

    if (pass !== window.ADMIN_PASSWORD_LOCAL) {
        setTimeout(() => {
            if (errorMsg) {
                errorMsg.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> Senha incorreta.';
                errorMsg.classList.remove('hidden');
            }
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
            input.value = '';
            input.focus();
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        }, 600);
        return;
    }

    window.adminState.password = pass;
    window.adminState.isAuthenticated = true;

    setTimeout(() => {
        document.getElementById('admin-login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        input.value = '';
        window.loadAdminTab('eventos');
    }, 600);
};

document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('admin-password');
    if (passInput) {
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); window.adminLogin(); }
        });
    }
});

window.handleServerAuthError = (result) => {
    if (result && result.message && result.message.toLowerCase().indexOf('senha incorreta') !== -1) {
        alert('Sessão expirada. Faça login novamente.');
        window.adminState.isAuthenticated = false;
        window.adminState.password = '';
        window.closeAdmin();
        setTimeout(() => window.openAdmin(), 400);
        return true;
    }
    return false;
};

// ============================================================
// CARREGAR ABA
// ============================================================
window.loadAdminTab = async (tab) => {
    window.adminState.currentTab = tab;

    document.querySelectorAll('.admin-tab').forEach(b => {
        if (b.dataset.tab === tab) b.classList.add('active', 'bg-white/10', 'text-white');
        else b.classList.remove('active', 'bg-white/10', 'text-white');
    });

    const btnNewItem = document.getElementById('btn-new-item');
    if (btnNewItem) btnNewItem.style.display = (tab === 'config' || tab === 'config_radio') ? 'none' : 'flex';

    const contentArea = document.getElementById('admin-content-area');
    contentArea.innerHTML = '<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-brand-yellow"></i><p class="mt-2 text-gray-400">Carregando dados...</p></div>';

    try {
        if (tab === 'radio') {
            const [gradeData, liveConfig] = await Promise.all([
                window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=radio', 'admin_radio', true),
                window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=config_radio', 'admin_config_radio', true)
            ]);
            window.adminState.currentData = Array.isArray(gradeData) ? gradeData : [];
            window.adminState.currentLiveConfig = (Array.isArray(liveConfig) && liveConfig[0]) ? liveConfig[0] : { facebookLiveUrl: '', isLive: 'false' };
            window.renderRadioAdmin();
            return;
        }

        const data = await window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=' + tab, 'admin_' + tab, true);

        if (tab === 'config') {
            const configData = (Array.isArray(data) && data.length > 0) ? data : [{
                logoUrl: '', heroUrl: '', heroUrlMobile: '',
                heroPosition: 'center', heroAlign: 'center', heroPosX: 50, heroPosY: 50,
                heroTitle: 'JARDIM\\nNOVA ALIANÇA',
                heroSubtitle: 'Bem-vindo à casa do pai',
                heroDescription: 'Um lugar de adoração, comunhão e crescimento espiritual.'
            }];
            window.adminState.currentData = configData;
            window.renderConfigForm(configData[0]);
        } else {
            window.adminState.currentData = Array.isArray(data) ? data : [];
            window.renderAdminTable(window.adminState.currentData, tab);
        }
    } catch (e) {
        contentArea.innerHTML = '<p class="text-red-400 text-center">Erro ao carregar dados.</p>';
    }
};

// ============================================================
// RENDERIZAR TABELA GENÉRICA
// ============================================================
window.renderAdminTable = (data, tab) => {
    const container = document.getElementById('admin-content-area');
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-10">Nenhum item encontrado.</p>';
        return;
    }

    let displayKey = Object.keys(data[0])[0];
    if (data[0].name) displayKey = 'name';
    if (data[0].nome) displayKey = 'nome';
    if (data[0].titulo) displayKey = 'titulo';
    if (data[0].title) displayKey = 'title';
    if (data[0].albumName) displayKey = 'albumName';

    let html = '<div class="grid gap-2">';
    const displayData = [...data].reverse();

    displayData.forEach((item, index) => {
        const realIndex = data.length - 1 - index;
        const imgUrl = item.coverUrl || item.capa || item.coverImageUrl || item.imageUrl;
        const imgHtml = imgUrl ? '<img src="' + window.optimizeImage(imgUrl, 100) + '" loading="lazy" class="w-12 h-12 object-cover rounded mr-3 bg-black/20" onerror="this.style.display=\'none\'">' : '';

        let statusBadge = '';
        if (item.active !== undefined || item.ativo !== undefined) {
            const val = item.active !== undefined ? item.active : item.ativo;
            const isActive = String(val).toLowerCase() !== 'false' && String(val) !== '0';
            statusBadge = isActive
                ? '<span class="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded ml-2">ativo</span>'
                : '<span class="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded ml-2">inativo</span>';
        }

        // ✅ Botão "Fotos" só para álbuns — passa o ID correto
        let btnFotosHtml = '';
        if (tab === 'albuns') {
            const safeId = String(item.id || '');
            const safeName = String(item.albumName || 'Álbum').replace(/'/g, "\\'");
            const safeUrl = String(item.albumUrl || '').replace(/'/g, "\\'");
            btnFotosHtml = '<button onclick="window.openAlbumEditor(\'' + safeId + '\', \'' + safeName + '\', \'' + safeUrl + '\')" class="bg-brand-yellow hover:bg-white text-brand-dark p-2 rounded text-xs font-bold" title="Gerenciar fotos"><i class="fas fa-camera"></i> Fotos</button>';
        }

        html += '<div class="bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/5 hover:bg-white/10 transition-colors">' +
                    '<div class="flex items-center overflow-hidden pr-4 w-full">' +
                        imgHtml +
                        '<div class="truncate flex-1">' +
                            '<div class="flex items-center">' +
                                '<span class="font-bold text-white block truncate">' + (item[displayKey] || 'Item sem título') + '</span>' +
                                statusBadge +
                            '</div>' +
                            '<span class="text-xs text-gray-400">' + Object.keys(item).length + ' campos</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="flex gap-2 shrink-0">' +
                        btnFotosHtml +
                        '<button onclick="window.openEditModal(\'edit\', ' + realIndex + ')" class="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-xs"><i class="fas fa-edit"></i></button>' +
                        '<button onclick="window.deleteAdminItem(' + realIndex + ')" class="bg-red-600 hover:bg-red-500 text-white p-2 rounded text-xs"><i class="fas fa-trash"></i></button>' +
                    '</div>' +
                '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
};

// ============================================================
// RENDERIZAR ADMIN DA RÁDIO
// ============================================================
window.renderRadioAdmin = () => {
    const container = document.getElementById('admin-content-area');
    const liveConfig = window.adminState.currentLiveConfig || { facebookLiveUrl: '', isLive: 'false' };
    const isLive = String(liveConfig.isLive).toLowerCase() === 'true';
    const liveCode = liveConfig.facebookLiveUrl || '';

    container.innerHTML =
        '<div class="max-w-4xl mx-auto py-4">' +
            '<div class="bg-blue-500/5 p-6 rounded-xl border-2 border-blue-500/30 mb-6">' +
                '<div class="flex items-start gap-3 mb-4">' +
                    '<div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><i class="fab fa-facebook-f text-blue-400 text-xl"></i></div>' +
                    '<div><h3 class="text-xl font-bold text-white">Transmissão ao Vivo</h3><p class="text-sm text-gray-400 mt-1">Cole o <strong>código de incorporação</strong> da live do Facebook.</p></div>' +
                '</div>' +
                '<textarea id="radio-live-url" class="admin-field font-mono" rows="6" placeholder="Cole o código completo do Facebook" style="font-size: 0.8rem; padding: 0.85rem 1rem; line-height: 1.4; resize: vertical;">' + liveCode.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</textarea>' +
                '<div class="mt-5 flex items-center gap-3 flex-wrap">' +
                    (isLive ?
                        '<span class="inline-flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/40 px-4 py-2.5 rounded-lg text-sm font-bold"><span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> AO VIVO AGORA</span>' +
                        '<button onclick="window.stopRadioLive()" class="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors"><i class="fas fa-stop"></i> Encerrar Live</button>'
                        :
                        '<button onclick="window.startRadioLive()" class="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg"><i class="fas fa-broadcast-tower"></i> Ativar Transmissão ao Vivo</button>'
                    ) +
                    '<span id="radio-live-status" class="text-xs text-gray-500"></span>' +
                '</div>' +
            '</div>' +
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10">' +
                '<h3 class="text-lg font-bold text-white flex items-center gap-2 mb-2"><i class="fas fa-list text-brand-yellow"></i> Grade de Programação</h3>' +
                '<div id="radio-grade-list"></div>' +
            '</div>' +
        '</div>';

    window.renderRadioGrade();
};

window.renderRadioGrade = () => {
    const list = document.getElementById('radio-grade-list');
    if (!list) return;
    const data = window.adminState.currentData || [];
    if (data.length === 0) {
        list.innerHTML = '<p class="text-gray-500 text-center py-6">Nenhum programa cadastrado.</p>';
        return;
    }
    let html = '<div class="grid gap-2">';
    const displayData = [...data].reverse();
    displayData.forEach((item, index) => {
        const realIndex = data.length - 1 - index;
        const ativo = String(item.ativo).toLowerCase() !== 'false';
        const formatHora = (h) => {
            if (!h) return '?';
            const s = String(h);
            if (s.indexOf('T') !== -1) { const t = s.split('T')[1]; return t ? t.substring(0, 5) : '?'; }
            return s.substring(0, 5);
        };
        html += '<div class="bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/5 hover:bg-white/10 transition-colors">' +
                    '<div class="flex items-center overflow-hidden pr-4 w-full">' +
                        '<div class="truncate flex-1">' +
                            '<div class="flex items-center gap-2 flex-wrap">' +
                                '<span class="font-bold text-white">' + (item.programa || 'Sem nome') + '</span>' +
                                '<span class="text-xs text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/20 px-2 py-0.5 rounded">' + formatHora(item.inicio) + ' - ' + formatHora(item.fim) + '</span>' +
                                (item.dias ? '<span class="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">📅 ' + item.dias + '</span>' : '') +
                                (ativo ? '<span class="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">ativo</span>' : '<span class="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">inativo</span>') +
                            '</div>' +
                            '<div class="text-xs text-gray-400 mt-1">📱 ' + (item.whatsapp || 'sem whatsapp') + (item.textoBotao ? ' · 💬 ' + item.textoBotao : '') + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="flex gap-2 shrink-0">' +
                        '<button onclick="window.openEditModal(\'edit\', ' + realIndex + ')" class="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-xs"><i class="fas fa-edit"></i></button>' +
                        '<button onclick="window.deleteAdminItem(' + realIndex + ')" class="bg-red-600 hover:bg-red-500 text-white p-2 rounded text-xs"><i class="fas fa-trash"></i></button>' +
                    '</div>' +
                '</div>';
    });
    html += '</div>';
    list.innerHTML = html;
};

// ============================================================
// START / STOP LIVE
// ============================================================
window.startRadioLive = async () => {
    const urlInput = document.getElementById('radio-live-url');
    const statusEl = document.getElementById('radio-live-status');
    const url = urlInput ? urlInput.value.trim() : '';
    if (!url) { alert('Cole o código de incorporação do Facebook antes de ativar.'); return; }
    if (statusEl) { statusEl.textContent = 'Ativando...'; statusEl.style.color = '#EEBC5A'; }
    try {
        const res = await fetch(window.CONFIG.scriptUrl, {
            method: 'POST',
            body: JSON.stringify({ sheet: 'config_radio', action: 'edit', password: window.adminState.password, originalId: 'config_radio', data: { facebookLiveUrl: url, isLive: 'true' } })
        });
        const result = await res.json();
        if (window.handleServerAuthError(result)) return;
        if (result.success) {
            if (statusEl) { statusEl.textContent = '✅ Live ativada!'; statusEl.style.color = '#22c55e'; }
            window.notifyDataChanged();
            setTimeout(() => window.loadAdminTab('radio'), 500);
        } else { alert('Erro: ' + result.message); }
    } catch(e) { alert('Erro de conexão: ' + e.message); }
};

window.stopRadioLive = async () => {
    if (!confirm('Encerrar a transmissão ao vivo?')) return;
    const statusEl = document.getElementById('radio-live-status');
    if (statusEl) { statusEl.textContent = 'Encerrando...'; statusEl.style.color = '#EEBC5A'; }
    try {
        const res = await fetch(window.CONFIG.scriptUrl, {
            method: 'POST',
            body: JSON.stringify({ sheet: 'config_radio', action: 'edit', password: window.adminState.password, originalId: 'config_radio', data: { facebookLiveUrl: '', isLive: 'false' } })
        });
        const result = await res.json();
        if (window.handleServerAuthError(result)) return;
        if (result.success) {
            if (statusEl) { statusEl.textContent = '✅ Live encerrada.'; statusEl.style.color = '#22c55e'; }
            window.notifyDataChanged();
            setTimeout(() => window.loadAdminTab('radio'), 500);
        } else { alert('Erro: ' + result.message); }
    } catch(e) { alert('Erro de conexão: ' + e.message); }
};

// ============================================================
// MODAL DE EDIÇÃO DE ÁLBUM (fotos + capa)
// Recebe ID, nome e URL do álbum
// ============================================================
window.openAlbumEditor = async (albumId, albumName, albumUrl) => {
    if (!albumId) {
        alert('Este álbum ainda não foi salvo. Salve o álbum primeiro para poder adicionar fotos.');
        return;
    }

    window.__albumEditor = {
        albumId: albumId,
        albumName: albumName || 'Álbum',
        albumUrl: albumUrl || '',
        fotos: [],
        capaIndex: 0,
        subindo: false
    };

    try {
        const todasFotos = await window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=fotos', 'admin_fotos_' + albumId, true);
        if (Array.isArray(todasFotos)) {
            window.__albumEditor.fotos = todasFotos
                .filter(f => String(f.albumId) === String(albumId))
                .sort((a, b) => (parseInt(a.ordem) || 0) - (parseInt(b.ordem) || 0))
                .map(f => f.url)
                .filter(u => u);
        }
    } catch (e) { console.warn('Erro ao carregar fotos:', e); }

    window.renderAlbumEditor();
};

window.renderAlbumEditor = () => {
    const state = window.__albumEditor;
    if (!state) return;

    let modal = document.getElementById('album-editor-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'album-editor-modal';
        modal.className = 'fixed inset-0 z-[85] hidden items-center justify-center p-4';
        document.body.appendChild(modal);
    }

    const capaUrl = state.fotos[state.capaIndex] || '';

    modal.innerHTML =
        '<div class="absolute inset-0 bg-black/90 backdrop-blur-sm" onclick="window.closeAlbumEditor()"></div>' +
        '<div class="bg-brand-surface w-full max-w-4xl rounded-xl border border-white/10 relative z-10 shadow-2xl flex flex-col max-h-[92vh]">' +

            '<div class="p-4 border-b border-white/10 flex justify-between items-center shrink-0">' +
                '<h3 class="text-white font-bold text-lg"><i class="fas fa-camera text-brand-yellow mr-2"></i> Gerenciar Fotos — ' + state.albumName + '</h3>' +
                '<button onclick="window.closeAlbumEditor()" class="text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>' +
            '</div>' +

            '<div class="p-4 border-b border-white/10 bg-white/5 flex flex-wrap gap-3 items-center shrink-0">' +
                '<input type="file" id="album-editor-input" accept="image/*" multiple class="hidden">' +
                '<button type="button" onclick="document.getElementById(\'album-editor-input\').click()" class="bg-brand-yellow text-brand-dark font-bold px-5 py-2.5 rounded-lg hover:bg-white transition-colors flex items-center gap-2 text-sm">' +
                    '<i class="fas fa-upload"></i> Adicionar Fotos do Computador' +
                '</button>' +
                '<span id="album-editor-status" class="text-xs text-gray-400"></span>' +
                '<div class="flex-1"></div>' +
                '<span id="album-editor-count" class="text-xs text-gray-400">' + state.fotos.length + ' foto(s)</span>' +
            '</div>' +

            '<div class="p-4 overflow-y-auto flex-grow" id="album-editor-grid" style="min-height: 200px;"></div>' +

            '<div class="p-4 border-t border-white/10 bg-black/20 flex flex-wrap gap-3 justify-between items-center shrink-0">' +
                '<div class="flex items-center gap-3">' +
                    '<span class="text-xs text-gray-400 font-bold uppercase">Capa do álbum:</span>' +
                    '<div class="w-12 h-12 bg-black/40 rounded-lg border-2 border-brand-yellow overflow-hidden flex items-center justify-center">' +
                        (capaUrl ? '<img src="' + window.optimizeImage(capaUrl, 100) + '" class="w-full h-full object-cover">' : '<i class="fas fa-image text-gray-600 text-xs"></i>') +
                    '</div>' +
                '</div>' +
                '<div class="flex gap-2">' +
                    '<button onclick="window.closeAlbumEditor()" class="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>' +
                    '<button onclick="window.saveAlbumEditor()" id="btn-save-album" class="bg-brand-yellow text-brand-dark font-bold px-6 py-2 rounded-lg hover:bg-white transition-colors"><i class="fas fa-save mr-1"></i> Salvar Álbum</button>' +
                '</div>' +
            '</div>' +

        '</div>';

    const fileInput = document.getElementById('album-editor-input');
    fileInput.onchange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) window.handleAlbumEditorUpload(files);
        fileInput.value = '';
    };

    window.renderAlbumEditorGrid();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.renderAlbumEditorGrid = () => {
    const state = window.__albumEditor;
    const grid = document.getElementById('album-editor-grid');
    const countEl = document.getElementById('album-editor-count');
    if (!grid || !state) return;

    if (countEl) countEl.textContent = state.fotos.length + ' foto(s)';

    if (state.fotos.length === 0) {
        grid.innerHTML = '<div class="text-center py-12 text-gray-500">' +
                            '<i class="fas fa-images text-5xl mb-4 opacity-30"></i>' +
                            '<p>Nenhuma foto ainda.</p>' +
                            '<p class="text-xs mt-2">Clique em "Adicionar Fotos" e escolha as imagens do seu computador.</p>' +
                        '</div>';
        return;
    }

    grid.innerHTML = '<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">' +
        state.fotos.map((url, idx) => {
            const isCapa = idx === state.capaIndex;
            return '<div class="relative group aspect-square bg-black/30 rounded-lg overflow-hidden border-2 ' + (isCapa ? 'border-brand-yellow' : 'border-white/10') + '">' +
                        '<img src="' + window.optimizeImage(url, 300) + '" loading="lazy" class="w-full h-full object-cover" onerror="this.style.opacity=\'0.3\'">' +

                        (isCapa ?
                            '<div class="absolute top-1 left-1 bg-brand-yellow text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i class="fas fa-star"></i> CAPA</div>'
                            :
                            '<button onclick="window.setAlbumCapa(' + idx + ')" class="absolute top-1 left-1 bg-black/70 hover:bg-brand-yellow hover:text-brand-dark text-white text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Definir capa</button>'
                        ) +

                        '<button onclick="window.removeAlbumEditorPhoto(' + idx + ')" class="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Remover">' +
                            '<i class="fas fa-times"></i>' +
                        '</button>' +

                        '<div class="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">' + (idx + 1) + '</div>' +
                    '</div>';
        }).join('') +
    '</div>';
};

window.setAlbumCapa = (idx) => {
    if (!window.__albumEditor) return;
    window.__albumEditor.capaIndex = idx;
    window.renderAlbumEditor();
};

window.removeAlbumEditorPhoto = (idx) => {
    const state = window.__albumEditor;
    if (!state) return;
    state.fotos.splice(idx, 1);
    if (state.capaIndex >= state.fotos.length) state.capaIndex = Math.max(0, state.fotos.length - 1);
    window.renderAlbumEditor();
};

window.closeAlbumEditor = () => {
    const modal = document.getElementById('album-editor-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    window.__albumEditor = null;
};

// ============================================================
// UPLOAD EM LOTE NO EDITOR DE ÁLBUM
// ============================================================
window.handleAlbumEditorUpload = async (files) => {
    const state = window.__albumEditor;
    if (!state) return;

    const statusEl = document.getElementById('album-editor-status');
    const saveBtn = document.getElementById('btn-save-album');
    if (saveBtn) saveBtn.disabled = true;
    state.subindo = true;

    const total = files.length;
    let enviados = 0;
    let erros = 0;

    const updateStatus = () => {
        if (statusEl) {
            statusEl.textContent = 'Enviando ' + enviados + '/' + total + (erros > 0 ? ' (' + erros + ' falharam)' : '') + '...';
            statusEl.style.color = '#EEBC5A';
        }
    };

    updateStatus();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type || file.type.indexOf('image/') !== 0) { erros++; continue; }

        try {
            const result = await window.uploadCompressedPhoto(file);
            if (result.success && result.url) {
                state.fotos.push(result.url);
                enviados++;
                window.renderAlbumEditorGrid();
            } else {
                erros++;
                console.warn('Falha no upload de ' + file.name + ':', result.message);
            }
        } catch (e) {
            erros++;
            console.warn('Erro no upload de ' + file.name + ':', e.message);
        }
        updateStatus();
    }

    if (statusEl) {
        statusEl.textContent = '✅ ' + enviados + ' foto(s) enviada(s)' + (erros > 0 ? ' · ❌ ' + erros + ' falharam' : '');
        statusEl.style.color = erros > 0 ? '#f59e0b' : '#22c55e';
    }

    state.subindo = false;
    if (saveBtn) saveBtn.disabled = false;
};

// ============================================================
// SALVAR ÁLBUM (fotos + capa)
// ============================================================
window.saveAlbumEditor = async () => {
    const state = window.__albumEditor;
    if (!state) return;

    if (!state.albumId) {
        alert('ID do álbum não encontrado. Salve o álbum primeiro.');
        return;
    }

    const saveBtn = document.getElementById('btn-save-album');
    const statusEl = document.getElementById('album-editor-status');

    if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Salvando...'; }
    if (statusEl) { statusEl.textContent = 'Salvando no servidor...'; statusEl.style.color = '#EEBC5A'; }

    const capaUrl = state.fotos[state.capaIndex] || '';

    try {
        // 1) Atualiza o álbum (nome, link, capa)
        const albumPayload = {
            sheet: 'albuns',
            action: 'edit',
            password: window.adminState.password,
            originalId: state.albumId,
            data: {
                albumName: state.albumName,
                albumUrl: state.albumUrl,
                coverImageUrl: capaUrl
            }
        };

        const resAlbum = await fetch(window.CONFIG.scriptUrl, {
            method: 'POST',
            body: JSON.stringify(albumPayload)
        });
        const resultAlbum = await resAlbum.json();

        if (window.handleServerAuthError(resultAlbum)) return;
        if (!resultAlbum.success) {
            alert('Erro ao salvar álbum: ' + resultAlbum.message);
            if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Álbum'; }
            return;
        }

        // 2) Salva as fotos na aba `fotos`
        const fotosPayload = {
            action: 'saveAlbumPhotos',
            password: window.adminState.password,
            albumId: state.albumId,
            fotos: state.fotos
        };

        const resFotos = await fetch(window.CONFIG.scriptUrl, {
            method: 'POST',
            body: JSON.stringify(fotosPayload)
        });
        const resultFotos = await resFotos.json();

        if (window.handleServerAuthError(resultFotos)) return;
        if (!resultFotos.success) {
            alert('Erro ao salvar fotos: ' + resultFotos.message);
            if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Álbum'; }
            return;
        }

        if (statusEl) { statusEl.textContent = '✅ Tudo salvo!'; statusEl.style.color = '#22c55e'; }

        window.notifyDataChanged();
        alert('✅ Álbum salvo com sucesso!\n' + state.fotos.length + ' foto(s) + capa definida.');
        window.closeAlbumEditor();

        setTimeout(() => window.loadAdminTab('albuns'), 500);

    } catch (e) {
        alert('Erro de conexão: ' + e.message);
        if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Álbum'; }
    }
};

// ============================================================
// RENDERIZAR FORM DE CONFIG
// ============================================================
window.renderConfigForm = (config) => {
    const container = document.getElementById('admin-content-area');
    const logoUrl = config.logoUrl || '';
    const heroUrl = config.heroUrl || '';
    const heroUrlMobile = config.heroUrlMobile || '';
    const heroTitle = config.heroTitle || 'JARDIM\\nNOVA ALIANÇA';
    const heroSubtitle = config.heroSubtitle || 'Bem-vindo à casa do pai';
    const heroDescription = config.heroDescription || 'Um lugar de adoração, comunhão e crescimento espiritual.';

    container.innerHTML =
        '<div class="max-w-4xl mx-auto py-4">' +
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2"><i class="fas fa-image mr-2"></i> URL da Logomarca</label>' +
                '<input type="text" id="config-logoUrl" class="admin-field" value="' + logoUrl + '">' +
                '<div class="mt-2"><input type="file" id="config-logoUrl-file" accept="image/*" class="hidden" onchange="window.handleConfigUpload(event, \'logoUrl\')"><button type="button" onclick="document.getElementById(\'config-logoUrl-file\').click()" class="bg-brand-yellow/20 hover:bg-brand-yellow/30 text-brand-yellow border border-brand-yellow/30 px-4 py-2 rounded-lg text-xs font-bold"><i class="fas fa-upload"></i> Enviar do Computador</button></div>' +
            '</div>' +
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2"><i class="fas fa-desktop mr-2"></i> Hero PC</label>' +
                '<input type="text" id="config-heroUrl" class="admin-field" value="' + heroUrl + '">' +
                '<div class="mt-2"><input type="file" id="config-heroUrl-file" accept="image/*" class="hidden" onchange="window.handleConfigUpload(event, \'heroUrl\')"><button type="button" onclick="document.getElementById(\'config-heroUrl-file\').click()" class="bg-brand-yellow/20 hover:bg-brand-yellow/30 text-brand-yellow border border-brand-yellow/30 px-4 py-2 rounded-lg text-xs font-bold"><i class="fas fa-upload"></i> Enviar do Computador</button></div>' +
            '</div>' +
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2"><i class="fas fa-mobile-alt mr-2"></i> Hero Mobile</label>' +
                '<input type="text" id="config-heroUrlMobile" class="admin-field" value="' + heroUrlMobile + '">' +
                '<div class="mt-2"><input type="file" id="config-heroUrlMobile-file" accept="image/*" class="hidden" onchange="window.handleConfigUpload(event, \'heroUrlMobile\')"><button type="button" onclick="document.getElementById(\'config-heroUrlMobile-file\').click()" class="bg-brand-yellow/20 hover:bg-brand-yellow/30 text-brand-yellow border border-brand-yellow/30 px-4 py-2 rounded-lg text-xs font-bold"><i class="fas fa-upload"></i> Enviar do Computador</button></div>' +
            '</div>' +
            '<div class="mt-8 pt-4 border-t border-white/10 flex justify-end">' +
                '<button onclick="window.saveConfig()" class="bg-brand-yellow text-brand-dark font-bold px-8 py-3 rounded-lg hover:bg-white transition-colors flex items-center gap-2 shadow-lg"><i class="fas fa-save"></i> Salvar Configurações</button>' +
            '</div>' +
        '</div>';
};

window.handleConfigUpload = async (event, targetFieldKey) => {
    const input = event.target;
    const file = input.files && input.files[0];
    if (!file) return;
    const statusEl = document.getElementById('config-' + targetFieldKey + '-status');
    const textInput = document.getElementById('config-' + targetFieldKey);
    const setStatus = (msg, color) => { if (statusEl) { statusEl.textContent = msg; statusEl.style.color = color || '#9ca3af'; } };
    setStatus('Enviando...', '#EEBC5A');
    const result = await window.uploadImageToImgBB(file);
    if (!result.success) {
        setStatus('❌ ' + result.message, '#ef4444');
        input.value = '';
        return;
    }
    setStatus('✅ Enviada!', '#22c55e');
    if (textInput) { textInput.value = result.url; textInput.dispatchEvent(new Event('input', { bubbles: true })); }
    input.value = '';
};

window.saveConfig = async () => {
    const payload = {
        sheet: 'config', action: 'edit', password: window.adminState.password,
        originalId: 'config',
        data: {
            logoUrl: document.getElementById('config-logoUrl').value.trim(),
            heroUrl: document.getElementById('config-heroUrl').value.trim(),
            heroUrlMobile: document.getElementById('config-heroUrlMobile').value.trim(),
            heroPosition: 'center',
            heroAlign: 'center',
            heroPosX: 50, heroPosY: 50,
            heroTitle: document.getElementById('config-heroTitle') ? document.getElementById('config-heroTitle').value : heroTitle,
            heroSubtitle: document.getElementById('config-heroSubtitle') ? document.getElementById('config-heroSubtitle').value : heroSubtitle,
            heroDescription: document.getElementById('config-heroDescription') ? document.getElementById('config-heroDescription').value : heroDescription
        }
    };
    try {
        const res = await fetch(window.CONFIG.scriptUrl, { method: 'POST', body: JSON.stringify(payload) });
        const result = await res.json();
        if (window.handleServerAuthError(result)) return;
        if (result.success) { window.notifyDataChanged(); alert('✅ Configurações salvas!'); }
        else { alert('Erro: ' + result.message); }
    } catch(e) { alert('Erro: ' + e.message); }
};

// ============================================================
// MODAL DE EDIÇÃO DE ITEM
// ============================================================
window.openEditModal = (mode, index) => {
    const modal = document.getElementById('edit-item-modal');
    const container = document.getElementById('edit-form-container');
    const title = document.getElementById('edit-modal-title');
    const btn = document.getElementById('btn-save-item');

    const tab = window.adminState.currentTab;
    const schema = window.SCHEMAS[tab] || [];

    container.innerHTML = '';
    title.textContent = mode === 'add' ? 'Adicionar Novo Item' : 'Editar Item';

    let itemData = {};
    if (mode === 'edit' && index !== null && index !== undefined) {
        itemData = window.adminState.currentData[index] || {};
        btn.dataset.originalId = itemData.id || '';
    } else {
        btn.dataset.originalId = '';
    }

    btn.dataset.mode = mode;
    btn.dataset.index = index;

    schema.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-1';

        const label = document.createElement('label');
        label.className = 'text-xs text-gray-400 font-bold uppercase';
        label.textContent = field.label;

        let input;

        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 3;
        } else if (field.type === 'select') {
            input = document.createElement('select');
            (field.options || []).forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                if (itemData[field.key] === opt || (!itemData[field.key] && field.default === opt)) option.selected = true;
                input.appendChild(option);
            });
        } else if (field.type === 'color') {
            input = document.createElement('input');
            input.type = 'color';
            if (!itemData[field.key] && field.default) input.value = field.default;
        } else if (field.type === 'number') {
            input = document.createElement('input');
            input.type = 'number';
            if (!itemData[field.key] && field.default !== undefined) input.value = field.default;
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }

        input.className = 'admin-field';
        input.id = 'field-' + field.key;

        let val = itemData[field.key];
        if (val === undefined || val === null) val = field.default !== undefined ? field.default : '';

        if (field.type === 'time' && val && String(val).indexOf('T') !== -1) {
            const parts = String(val).split('T');
            if (parts[1]) val = parts[1].substring(0, 5);
        }

        if (field.type !== 'color' || val) input.value = val;

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        if (field.hint) {
            const hint = document.createElement('p');
            hint.className = 'text-[10px] text-gray-500 italic mt-1';
            hint.textContent = field.hint;
            wrapper.appendChild(hint);
        }

        if (field.upload === true) {
            const uploadRow = document.createElement('div');
            uploadRow.className = 'flex items-center gap-2 mt-2';
            const fileInputId = 'upload-' + field.key;
            const statusId = 'upload-status-' + field.key;

            uploadRow.innerHTML =
                '<input type="file" id="' + fileInputId + '" accept="image/*" class="hidden">' +
                '<button type="button" data-upload-trigger="' + fileInputId + '" class="bg-brand-yellow/20 hover:bg-brand-yellow/30 text-brand-yellow border border-brand-yellow/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2"><i class="fas fa-upload"></i> Enviar do Computador</button>' +
                '<span id="' + statusId + '" class="text-[10px] text-gray-500"></span>';

            wrapper.appendChild(uploadRow);

            setTimeout(() => {
                const fileInput = document.getElementById(fileInputId);
                const trigger = uploadRow.querySelector('[data-upload-trigger]');
                const statusEl = document.getElementById(statusId);
                if (trigger && fileInput) trigger.addEventListener('click', () => fileInput.click());
                if (fileInput) {
                    fileInput.addEventListener('change', async (ev) => {
                        const file = ev.target.files && ev.target.files[0];
                        if (!file) return;
                        const setStatus = (msg, color) => { if (statusEl) { statusEl.textContent = msg; statusEl.style.color = color || '#9ca3af'; } };
                        setStatus('Enviando...', '#EEBC5A');
                        const result = await window.uploadImageToImgBB(file);
                        if (!result.success) {
                            setStatus('❌ ' + result.message, '#ef4444');
                            fileInput.value = '';
                            return;
                        }
                        setStatus('✅ Enviado!', '#22c55e');
                        input.value = result.url;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        fileInput.value = '';
                    });
                }
            }, 0);
        }

        if (window.isImageField(field.key)) {
            const preview = document.createElement('img');
            preview.className = 'w-full h-40 object-contain bg-black/20 rounded mt-2 border border-white/5 hidden';
            preview.onerror = () => preview.classList.add('hidden');
            const updatePreview = (url) => {
                if (url && url.trim()) {
                    preview.src = window.optimizeImage ? window.optimizeImage(url, 600) : url;
                    preview.classList.remove('hidden');
                } else preview.classList.add('hidden');
            };
            updatePreview(input.value);
            input.addEventListener('input', (e) => updatePreview(e.target.value));
            wrapper.appendChild(preview);
        }

        container.appendChild(wrapper);
    });

    // ✅ Se for álbum, adiciona botão para gerenciar fotos
    if (tab === 'albuns') {
        const photosSection = document.createElement('div');
        photosSection.className = 'mt-6 pt-6 border-t border-white/10';

        if (mode === 'edit' && index !== null && index !== undefined && itemData.id) {
            const safeId = String(itemData.id);
            const safeName = String(itemData.albumName || '').replace(/'/g, "\\'");
            const safeUrl = String(itemData.albumUrl || '').replace(/'/g, "\\'");
            photosSection.innerHTML =
                '<h4 class="text-sm font-bold text-brand-yellow mb-3"><i class="fas fa-camera mr-2"></i> Fotos do Álbum</h4>' +
                '<p class="text-xs text-gray-400 mb-3">Adicione/remova fotos e escolha a capa do álbum.</p>' +
                '<button type="button" onclick="window.closeEditModal(); window.openAlbumEditor(\'' + safeId + '\', \'' + safeName + '\', \'' + safeUrl + '\')" class="bg-brand-yellow text-brand-dark font-bold px-5 py-2.5 rounded-lg hover:bg-white transition-colors flex items-center gap-2 text-sm">' +
                    '<i class="fas fa-images"></i> Gerenciar Fotos e Capa' +
                '</button>';
        } else {
            photosSection.innerHTML =
                '<h4 class="text-sm font-bold text-brand-yellow mb-3"><i class="fas fa-camera mr-2"></i> Fotos do Álbum</h4>' +
                '<p class="text-xs text-gray-400 mb-3">Para adicionar fotos, primeiro <strong>salve o álbum</strong>. Depois você poderá subir as fotos e escolher a capa.</p>' +
                '<div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-300">' +
                    '<i class="fas fa-info-circle mr-1"></i> Salve o álbum primeiro para poder subir as fotos.' +
                '</div>';
        }
        container.appendChild(photosSection);
    }

    modal.classList.remove('hidden');
};

window.closeEditModal = () => document.getElementById('edit-item-modal').classList.add('hidden');

// ============================================================
// SALVAR ITEM
// ============================================================
window.saveAdminItem = async () => {
    const btn = document.getElementById('btn-save-item');
    const mode = btn.dataset.mode;
    const tab = window.adminState.currentTab;
    const schema = window.SCHEMAS[tab];
    const index = btn.dataset.index;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

    const newData = {};
    schema.forEach(field => {
        const el = document.getElementById('field-' + field.key);
        if (el) newData[field.key] = el.value;
    });

    const payload = {
        sheet: tab, action: mode,
        password: window.adminState.password, data: newData
    };
    if (mode === 'edit') payload.originalId = btn.dataset.originalId;

    try {
        const res = await fetch(window.CONFIG.scriptUrl, { method: 'POST', body: JSON.stringify(payload) });
        const result = await res.json();

        if (window.handleServerAuthError(result)) { btn.disabled = false; btn.textContent = 'Salvar'; return; }

        if (result.success) {
            // ✅ CORREÇÃO: se for álbum novo, guarda o ID retornado pelo Apps Script
            if (mode === 'add' && result.id) {
                newData.id = result.id;
            }

            if (mode === 'edit' && index !== null && index !== undefined) {
                window.adminState.currentData[index] = newData;
            } else {
                window.adminState.currentData.push(newData);
            }

            if (tab === 'radio') {
                await window.loadAdminTab('radio');
            } else {
                window.renderAdminTable(window.adminState.currentData, tab);
            }

            window.notifyDataChanged();
            alert('Salvo com sucesso!');
            window.closeEditModal();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch(e) {
        alert('Erro: ' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Salvar';
    }
};

// ============================================================
// DELETAR ITEM
// ============================================================
window.deleteAdminItem = async (index) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    const tab = window.adminState.currentTab;
    const item = window.adminState.currentData[index];
    const originalId = item.id || '';
    if (!originalId) { alert('Este item não tem ID.'); return; }
    try {
        const res = await fetch(window.CONFIG.scriptUrl, {
            method: 'POST',
            body: JSON.stringify({ sheet: tab, action: 'delete', password: window.adminState.password, originalId: originalId, data: {} })
        });
        const result = await res.json();
        if (window.handleServerAuthError(result)) return;
        if (result.success) {
            alert('Excluído!');
            window.adminState.currentData.splice(index, 1);
            if (tab === 'radio') { window.renderRadioGrade(); }
            else { window.renderAdminTable(window.adminState.currentData, tab); }
            window.notifyDataChanged();
        } else { alert('Erro: ' + result.message); }
    } catch(e) { alert('Erro: ' + e.message); }
};

console.log('🔐 admin.js carregado');
