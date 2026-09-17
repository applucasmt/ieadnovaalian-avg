// ============================================================
// IEAD NOVA ALIANÇA - PAINEL ADMIN
// ============================================================

talentos: [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'descricao', label: 'Descrição', type: 'textarea' },
    { key: 'telefone', label: 'Whatsapp', type: 'text' },
    { key: 'video', label: 'Link YouTube', type: 'text' },
    { key: 'videoFormat', label: '📐 Formato do Vídeo', type: 'select', options: ['auto', 'horizontal', 'vertical'], default: 'auto', hint: 'Escolha "vertical" para Shorts, "horizontal" para vídeos normais, ou "auto" para o sistema detectar.' },
    { key: 'capa', label: 'URL da Foto', type: 'text', upload: true }
],
    avisos: [
        { key: 'title', label: '📝 Título do Aviso', type: 'text', required: true },
        { key: 'subtitle', label: 'Subtítulo (linha acima do título)', type: 'text' },
        { key: 'description', label: 'Descrição (texto abaixo do título)', type: 'textarea' },
        { key: 'imageUrl', label: '🖼️ URL da Imagem de Fundo (opcional)', type: 'text', hint: 'Deixe vazio para usar só cor de fundo', upload: true },
        { key: 'bgColor', label: '🎨 Cor de Fundo (se não tiver imagem)', type: 'color', default: '#0f172a' },
        { key: 'textColor', label: '🎨 Cor do Texto', type: 'color', default: '#ffffff' },
        { key: 'buttonText', label: '🔘 Texto do Botão (ex: "Saiba mais")', type: 'text' },
        { key: 'buttonUrl', label: '🔗 Link do Botão', type: 'text', hint: 'Ex: https://exemplo.com ou /contato' },
        { key: 'position', label: '📍 Posição do Conteúdo', type: 'select', options: ['left', 'center', 'right', 'custom'], default: 'center' },
        { key: 'align', label: '↔️ Alinhamento do Texto (só para "custom")', type: 'select', options: ['left', 'center', 'right'], default: 'center' },
        { key: 'posX', label: '📍 Posição X % (só para "custom")', type: 'number', default: 50, hint: '0 = esquerda, 100 = direita' },
        { key: 'posY', label: '📍 Posição Y % (só para "custom")', type: 'number', default: 50, hint: '0 = topo, 100 = embaixo' },
        { key: 'order', label: '🔢 Ordem (menor número aparece primeiro)', type: 'number', default: 1 },
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
        { key: 'capa', label: 'URL da Foto', type: 'text', upload: true }
    ],
    albuns: [
        { key: 'albumName', label: 'Nome do Álbum', type: 'text' },
        { key: 'coverImageUrl', label: 'URL da Capa', type: 'text', upload: true },
        { key: 'albumUrl', label: 'Link do Álbum', type: 'text' }
    ],
    pastor: [
        { key: 'nome', label: 'Nome', type: 'text' },
        { key: 'capa', label: 'URL da Foto', type: 'text', upload: true }
    ]
};

window.heroState = {
    position: 'center',
    align: 'center',
    posX: 50,
    posY: 50,
    title: '',
    subtitle: '',
    description: ''
};

// ============================================================
// HELPER: campo de imagem?
// ============================================================
window.isImageField = (key) => {
    return ['coverUrl', 'capa', 'coverImageUrl', 'imageUrl'].indexOf(key) !== -1;
};

// ============================================================
// ✅ NOVO: helper para notificar outras abas + forçar reload
// Chamado após qualquer save/delete bem-sucedido.
// ============================================================
window.notifyDataChanged = () => {
    // 1. Recarrega os dados localmente
    if (typeof window.loadData === 'function') {
        window.loadData(true);
    }

    // 2. Notifica outras abas (mesmo navegador) + BroadcastChannel
    if (typeof window.broadcastDataChanged === 'function') {
        window.broadcastDataChanged();
    }
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
                errorMsg.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> Senha incorreta. Tente novamente.';
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
    if (btnNewItem) {
        btnNewItem.style.display = (tab === 'config') ? 'none' : 'flex';
    }

    const contentArea = document.getElementById('admin-content-area');
    contentArea.innerHTML = '<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-brand-yellow"></i><p class="mt-2 text-gray-400">Carregando dados...</p></div>';

    try {
        const data = await window.fetchWithCache(window.CONFIG.scriptUrl + '?sheet=' + tab, 'admin_' + tab, true);

        if (tab === 'config') {
            const configData = (Array.isArray(data) && data.length > 0) ? data : [{
                logoUrl: '', heroUrl: '', heroUrlMobile: '',
                heroPosition: 'center', heroAlign: 'center', heroPosX: 50, heroPosY: 50,
                heroTitle: 'JARDIM\\nNOVA ALIANÇA',
                heroSubtitle: 'Bem-vindo à casa do pai',
                heroDescription: 'Um lugar de adoração, comunhão e crescimento espiritual. Venha fazer parte desta família.'
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
// RENDERIZAR TABELA DE ITENS
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
    if (data[0].texto) displayKey = 'texto';
    if (data[0].title) displayKey = 'title';

    let html = '<div class="grid gap-2">';
    const displayData = [...data].reverse();

    displayData.forEach((item, index) => {
        const realIndex = data.length - 1 - index;
        const imgUrl = item.coverUrl || item.capa || item.coverImageUrl || item.imageUrl;
        const imgHtml = imgUrl ? '<img src="' + window.optimizeImage(imgUrl, 100) + '" loading="lazy" class="w-12 h-12 object-cover rounded mr-3 bg-black/20" onerror="this.style.display=\'none\'">' : '';

        let statusBadge = '';
        if (tab === 'avisos' && item.active !== undefined) {
            const isActive = String(item.active).toLowerCase() !== 'false' && String(item.active) !== '0';
            statusBadge = isActive
                ? '<span class="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded ml-2">ativo</span>'
                : '<span class="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded ml-2">inativo</span>';
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
                        '<button onclick="window.openEditModal(\'edit\', ' + realIndex + ')" class="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-xs"><i class="fas fa-edit"></i></button>' +
                        '<button onclick="window.deleteAdminItem(' + realIndex + ')" class="bg-red-600 hover:bg-red-500 text-white p-2 rounded text-xs"><i class="fas fa-trash"></i></button>' +
                    '</div>' +
                '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
};

// ============================================================
// RENDERIZAR FORM DE CONFIG
// ============================================================
window.renderConfigForm = (config) => {
    const container = document.getElementById('admin-content-area');

    const logoUrl = config.logoUrl || '';
    const heroUrl = config.heroUrl || '';
    const heroUrlMobile = config.heroUrlMobile || '';
    const currentPosition = config.heroPosition || 'center';
    const currentAlign = config.heroAlign || 'center';
    const currentPosX = parseFloat(config.heroPosX) || 50;
    const currentPosY = parseFloat(config.heroPosY) || 50;
    const heroTitle = config.heroTitle || 'JARDIM\\nNOVA ALIANÇA';
    const heroSubtitle = config.heroSubtitle || 'Bem-vindo à casa do pai';
    const heroDescription = config.heroDescription || 'Um lugar de adoração, comunhão e crescimento espiritual.';

    window.heroState = {
        position: currentPosition,
        align: currentAlign,
        posX: currentPosX,
        posY: currentPosY
    };

    const previewBgStyle = heroUrl ? 'background-image: url(\'' + heroUrl + '\');' : 'background: #0f172a;';

    container.innerHTML =
        '<div class="max-w-4xl mx-auto py-4">' +
            '<div class="mb-6 pb-4 border-b border-white/10">' +
                '<h3 class="text-xl font-bold text-white flex items-center gap-2">' +
                    '<i class="fas fa-palette text-brand-yellow"></i> Identidade Visual do Site' +
                '</h3>' +
                '<p class="text-xs text-gray-400 mt-1">Altere logo, imagens (PC e celular), posição e textos.</p>' +
            '</div>' +

            // PREVIEW
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-3">' +
                    '<i class="fas fa-eye mr-2"></i> Pré-visualização do Hero' +
                '</label>' +
                '<div class="hero-preview-box" id="hero-preview-box" style="' + previewBgStyle + '">' +
                    '<div class="hero-preview-overlay"></div>' +
                    '<div class="hero-preview-content preview-center" id="hero-preview-content">' +
                        '<div class="preview-badge" id="preview-badge">' + heroSubtitle + '</div>' +
                        '<div class="preview-title" id="preview-title">' + heroTitle.replace('\\n', '<br>') + '</div>' +
                        '<div class="preview-desc" id="preview-desc">' + heroDescription + '</div>' +
                        '<div class="preview-buttons">' +
                            '<span class="preview-btn-1"><i class="fas fa-play" style="font-size: 0.5rem;"></i> Assistir Culto</span>' +
                            '<span class="preview-btn-2">Fale Conosco</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<p class="text-[10px] text-gray-500 mt-2 italic">Esta é uma simulação fiel. O resultado final será idêntico.</p>' +
            '</div>' +

            // TEXTOS
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-3">' +
                    '<i class="fas fa-font mr-2"></i> Textos do Hero' +
                '</label>' +
                '<div class="space-y-3">' +
                    '<div>' +
                        '<label class="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Badge</label>' +
                        '<input type="text" id="config-heroSubtitle" class="admin-field" value="' + heroSubtitle + '" oninput="window.updatePreviewText()">' +
                    '</div>' +
                    '<div>' +
                        '<label class="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Título (use \\n para quebra)</label>' +
                        '<input type="text" id="config-heroTitle" class="admin-field" value="' + heroTitle + '" oninput="window.updatePreviewText()">' +
                    '</div>' +
                    '<div>' +
                        '<label class="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Descrição</label>' +
                        '<textarea id="config-heroDescription" rows="3" class="admin-field" oninput="window.updatePreviewText()">' + heroDescription + '</textarea>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            // POSIÇÃO
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-3">' +
                    '<i class="fas fa-arrows-alt mr-2"></i> Posição do Texto' +
                '</label>' +
                '<div class="flex gap-2 mb-4 flex-wrap">' +
                    '<button class="pos-btn ' + (currentPosition === 'left' ? 'active' : '') + '" onclick="window.setHeroPosition(\'left\')" data-pos="left">' +
                        '<i class="fas fa-align-left"></i> Esquerda' +
                    '</button>' +
                    '<button class="pos-btn ' + (currentPosition === 'center' ? 'active' : '') + '" onclick="window.setHeroPosition(\'center\')" data-pos="center">' +
                        '<i class="fas fa-align-center"></i> Centro' +
                    '</button>' +
                    '<button class="pos-btn ' + (currentPosition === 'right' ? 'active' : '') + '" onclick="window.setHeroPosition(\'right\')" data-pos="right">' +
                        '<i class="fas fa-align-right"></i> Direita' +
                    '</button>' +
                    '<button class="pos-btn ' + (currentPosition === 'custom' ? 'active' : '') + '" onclick="window.setHeroPosition(\'custom\')" data-pos="custom">' +
                        '<i class="fas fa-sliders-h"></i> Personalizado' +
                    '</button>' +
                '</div>' +

                '<div id="custom-controls" class="' + (currentPosition === 'custom' ? '' : 'hidden') + ' space-y-4 mt-4 pt-4 border-t border-white/10">' +
                    '<div>' +
                        '<label class="flex justify-between text-xs text-gray-400 mb-2">' +
                            '<span>Posição Horizontal (X)</span>' +
                            '<span id="posX-label" class="text-brand-yellow font-bold">' + currentPosX + '%</span>' +
                        '</label>' +
                        '<input type="range" id="slider-posX" class="admin-slider" min="0" max="100" value="' + currentPosX + '" oninput="window.updateHeroPreview()">' +
                    '</div>' +
                    '<div>' +
                        '<label class="flex justify-between text-xs text-gray-400 mb-2">' +
                            '<span>Posição Vertical (Y)</span>' +
                            '<span id="posY-label" class="text-brand-yellow font-bold">' + currentPosY + '%</span>' +
                        '</label>' +
                        '<input type="range" id="slider-posY" class="admin-slider" min="0" max="100" value="' + currentPosY + '" oninput="window.updateHeroPreview()">' +
                    '</div>' +
                    '<div>' +
                        '<label class="block text-xs text-gray-400 mb-2">Alinhamento do Texto</label>' +
                        '<div class="flex gap-2" id="align-buttons">' +
                            '<button class="pos-btn ' + (currentAlign === 'left' ? 'active' : '') + '" onclick="window.setHeroAlign(\'left\')" data-align="left" style="font-size: 0.7rem; padding: 0.4rem;">Esquerda</button>' +
                            '<button class="pos-btn ' + (currentAlign === 'center' ? 'active' : '') + '" onclick="window.setHeroAlign(\'center\')" data-align="center" style="font-size: 0.7rem; padding: 0.4rem;">Centro</button>' +
                            '<button class="pos-btn ' + (currentAlign === 'right' ? 'active' : '') + '" onclick="window.setHeroAlign(\'right\')" data-align="right" style="font-size: 0.7rem; padding: 0.4rem;">Direita</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            // LOGO
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2">' +
                    '<i class="fas fa-image mr-2"></i> URL da Logomarca' +
                '</label>' +
                '<input type="text" id="config-logoUrl" class="admin-field" placeholder="https://i.ibb.co/..." value="' + logoUrl + '">' +
                '<div class="mt-2">' +
                    '<input type="file" id="config-logoUrl-file" accept="image/*" class="hidden" onchange="window.handleConfigUpload(event, \'logoUrl\')">' +
                    '<button type="button" onclick="document.getElementById(\'config-logoUrl-file\').click()" class="bg-brand-yellow/20 hover:bg-brand-yellow/30 text-brand-yellow border border-brand-yellow/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">' +
                        '<i class="fas fa-upload"></i> Enviar Imagem do Computador' +
                    '</button>' +
                    '<span id="config-logoUrl-status" class="text-[10px] text-gray-500 ml-2"></span>' +
                '</div>' +
                '<div class="mt-4">' +
                    '<p class="text-xs text-gray-400 mb-2">Pré-visualização:</p>' +
                    '<div class="w-24 h-24 bg-black/30 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden">' +
                        '<img id="preview-logo" src="' + (logoUrl || '') + '" class="max-w-full max-h-full object-contain" onerror="this.style.display=\'none\'">' +
                    '</div>' +
                '</div>' +
            '</div>' +

            // HERO PC
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2">' +
                    '<i class="fas fa-desktop mr-2"></i> Foto de Fundo - PC (Horizontal)' +
                '</label>' +
                '<p class="text-[10px] text-gray-500 mb-2">Recomendado: 1920x1080px</p>' +
                '<input type="text" id="config-heroUrl" class="admin-field" placeholder="https://i.ibb.co/..." value="' + heroUrl + '" oninput="window.updateHeroPreviewImage(this.value)">' +
                '<div class="mt-2">' +
                    '<input type="file" id="config-heroUrl-file" accept="image/*" class="hidden" onchange="window.handleConfigUpload(event, \'heroUrl\')">' +
                    '<button type="button" onclick="document.getElementById(\'config-heroUrl-file\').click()" class="bg-brand-yellow/20 hover:bg-brand-yellow/30 text-brand-yellow border border-brand-yellow/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">' +
                        '<i class="fas fa-upload"></i> Enviar Imagem do Computador' +
                    '</button>' +
                    '<span id="config-heroUrl-status" class="text-[10px] text-gray-500 ml-2"></span>' +
                '</div>' +
            '</div>' +

            // HERO MOBILE
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2">' +
                    '<i class="fas fa-mobile-alt mr-2"></i> Foto de Fundo - Celular (Vertical)' +
                '</label>' +
                '<p class="text-[10px] text-gray-500 mb-2">Recomendado: 800x1200px (proporção 2:3)</p>' +
                '<input type="text" id="config-heroUrlMobile" class="admin-field" placeholder="https://i.ibb.co/..." value="' + heroUrlMobile + '">' +
                '<div class="mt-2">' +
                    '<input type="file" id="config-heroUrlMobile-file" accept="image/*" class="hidden" onchange="window.handleConfigUpload(event, \'heroUrlMobile\')">' +
                    '<button type="button" onclick="document.getElementById(\'config-heroUrlMobile-file\').click()" class="bg-brand-yellow/20 hover:bg-brand-yellow/30 text-brand-yellow border border-brand-yellow/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">' +
                        '<i class="fas fa-upload"></i> Enviar Imagem do Computador' +
                    '</button>' +
                    '<span id="config-heroUrlMobile-status" class="text-[10px] text-gray-500 ml-2"></span>' +
                '</div>' +
                '<div class="mt-4">' +
                    '<p class="text-xs text-gray-400 mb-2">Pré-visualização mobile:</p>' +
                    '<div class="w-32 h-48 bg-black/30 rounded-lg border border-white/10 overflow-hidden">' +
                        '<img id="preview-hero-mobile" src="' + (heroUrlMobile || '') + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'">' +
                    '</div>' +
                '</div>' +
            '</div>' +

            // BOTÃO SALVAR
            '<div class="mt-8 pt-4 border-t border-white/10 flex justify-end">' +
                '<button onclick="window.saveConfig()" class="bg-brand-yellow text-brand-dark font-bold px-8 py-3 rounded-lg hover:bg-white transition-colors flex items-center gap-2 shadow-lg">' +
                    '<i class="fas fa-save"></i> Salvar Configurações' +
                '</button>' +
            '</div>' +
        '</div>';

    window.updateHeroPreview();
    window.updatePreviewText();

    const inputLogo = document.getElementById('config-logoUrl');
    const previewLogo = document.getElementById('preview-logo');
    if (inputLogo && previewLogo) {
        inputLogo.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) { previewLogo.src = url; previewLogo.style.display = 'block'; }
            else { previewLogo.style.display = 'none'; }
        });
    }

    const inputHeroMobile = document.getElementById('config-heroUrlMobile');
    const previewHeroMobile = document.getElementById('preview-hero-mobile');
    if (inputHeroMobile && previewHeroMobile) {
        inputHeroMobile.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) { previewHeroMobile.src = url; previewHeroMobile.style.display = 'block'; }
            else { previewHeroMobile.style.display = 'none'; }
        });
    }
};

// ============================================================
// UPLOAD DE IMAGEM PARA O CONFIG (logo/hero)
// ============================================================
window.handleConfigUpload = async (event, targetFieldKey) => {
    const input = event.target;
    const file = input.files && input.files[0];
    if (!file) return;

    const statusEl = document.getElementById('config-' + targetFieldKey + '-status');
    const textInput = document.getElementById('config-' + targetFieldKey);

    const setStatus = (msg, color) => {
        if (statusEl) {
            statusEl.textContent = msg;
            statusEl.style.color = color || '#9ca3af';
        }
    };

    setStatus('Enviando...', '#EEBC5A');

    const result = await window.uploadImageToImgBB(file);

    if (!result.success) {
        setStatus('❌ ' + result.message, '#ef4444');
        input.value = '';
        return;
    }

    setStatus('✅ Imagem enviada!', '#22c55e');

    if (textInput) {
        textInput.value = result.url;
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (targetFieldKey === 'logoUrl') {
        const previewLogo = document.getElementById('preview-logo');
        if (previewLogo) { previewLogo.src = result.url; previewLogo.style.display = 'block'; }
    } else if (targetFieldKey === 'heroUrl') {
        window.updateHeroPreviewImage(result.url);
    } else if (targetFieldKey === 'heroUrlMobile') {
        const previewHeroMobile = document.getElementById('preview-hero-mobile');
        if (previewHeroMobile) { previewHeroMobile.src = result.url; previewHeroMobile.style.display = 'block'; }
    }

    input.value = '';
};

// ============================================================
// POSIÇÃO DO HERO
// ============================================================
window.setHeroPosition = (position) => {
    window.heroState.position = position;

    document.querySelectorAll('.pos-btn[data-pos]').forEach(b => {
        if (b.dataset.pos === position) b.classList.add('active');
        else b.classList.remove('active');
    });

    const customControls = document.getElementById('custom-controls');
    if (customControls) {
        if (position === 'custom') customControls.classList.remove('hidden');
        else customControls.classList.add('hidden');
    }

    window.updateHeroPreview();
};

window.setHeroAlign = (align) => {
    window.heroState.align = align;

    document.querySelectorAll('.pos-btn[data-align]').forEach(b => {
        if (b.dataset.align === align) b.classList.add('active');
        else b.classList.remove('active');
    });

    window.updateHeroPreview();
};

window.updateHeroPreview = () => {
    const preview = document.getElementById('hero-preview-content');
    if (!preview) return;

    const position = window.heroState.position;
    const align = window.heroState.align;

    preview.classList.remove('preview-left', 'preview-center', 'preview-right', 'preview-custom');

    if (position === 'custom') {
        const sliderX = document.getElementById('slider-posX');
        const sliderY = document.getElementById('slider-posY');
        const posX = sliderX ? sliderX.value : window.heroState.posX;
        const posY = sliderY ? sliderY.value : window.heroState.posY;

        window.heroState.posX = posX;
        window.heroState.posY = posY;

        const labelX = document.getElementById('posX-label');
        const labelY = document.getElementById('posY-label');
        if (labelX) labelX.textContent = posX + '%';
        if (labelY) labelY.textContent = posY + '%';

        preview.classList.add('preview-custom');
        preview.style.setProperty('--hero-x', posX + '%');
        preview.style.setProperty('--hero-y', posY + '%');
        preview.style.setProperty('--hero-align', align);
    } else {
        preview.classList.add('preview-' + position);
        preview.style.removeProperty('--hero-x');
        preview.style.removeProperty('--hero-y');
        preview.style.removeProperty('--hero-align');
    }
};

window.updatePreviewText = () => {
    const titleEl = document.getElementById('preview-title');
    const badgeEl = document.getElementById('preview-badge');
    const descEl = document.getElementById('preview-desc');

    const titleInput = document.getElementById('config-heroTitle');
    const subtitleInput = document.getElementById('config-heroSubtitle');
    const descInput = document.getElementById('config-heroDescription');

    if (titleEl && titleInput) {
        titleEl.innerHTML = titleInput.value.replace(/\\n/g, '<br>');
    }
    if (badgeEl && subtitleInput) {
        badgeEl.textContent = subtitleInput.value;
    }
    if (descEl && descInput) {
        descEl.textContent = descInput.value;
    }
};

window.updateHeroPreviewImage = (url) => {
    const box = document.getElementById('hero-preview-box');
    if (box && url) {
        box.style.backgroundImage = 'url(\'' + url + '\')';
    }
};

// ============================================================
// SALVAR CONFIG
// ✅ Chama notifyDataChanged() ao final
// ============================================================
window.saveConfig = async () => {
    const logoUrl = document.getElementById('config-logoUrl').value.trim();
    const heroUrl = document.getElementById('config-heroUrl').value.trim();
    const heroUrlMobile = document.getElementById('config-heroUrlMobile') ? document.getElementById('config-heroUrlMobile').value.trim() : '';
    const heroTitle = document.getElementById('config-heroTitle').value;
    const heroSubtitle = document.getElementById('config-heroSubtitle').value;
    const heroDescription = document.getElementById('config-heroDescription').value;

    const position = window.heroState.position;
    const align = window.heroState.align;
    const posX = window.heroState.posX;
    const posY = window.heroState.posY;

    const payload = {
        sheet: 'config',
        action: 'edit',
        password: window.adminState.password,
        originalId: 'config',
        data: {
            logoUrl: logoUrl,
            heroUrl: heroUrl,
            heroUrlMobile: heroUrlMobile,
            heroPosition: position,
            heroAlign: align,
            heroPosX: posX,
            heroPosY: posY,
            heroTitle: heroTitle,
            heroSubtitle: heroSubtitle,
            heroDescription: heroDescription
        }
    };

    try {
        const res = await fetch(window.CONFIG.scriptUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (window.handleServerAuthError(result)) return;

        if (result.success) {
            const newConfig = [payload.data];

            try {
                localStorage.setItem('cache_config_v2', JSON.stringify({
                    timestamp: Date.now(),
                    content: newConfig
                }));
            } catch(e) {}

            await window.applyConfigImages(newConfig[0]);

            // ✅ Notifica outras abas + recarrega localmente
            window.notifyDataChanged();

            alert('✅ Configurações salvas com sucesso!');
        } else {
            alert('Erro: ' + result.message);
        }
    } catch(e) {
        alert('Erro de conexão: ' + e.message);
    }
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
        // ✅ Usa a coluna "id" real
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
        }
        else if (field.type === 'select') {
            input = document.createElement('select');
            (field.options || []).forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                if (itemData[field.key] === opt || (!itemData[field.key] && field.default === opt)) {
                    option.selected = true;
                }
                input.appendChild(option);
            });
        }
        else if (field.type === 'color') {
            input = document.createElement('input');
            input.type = 'color';
            if (!itemData[field.key] && field.default) {
                input.value = field.default;
            }
        }
        else if (field.type === 'number') {
            input = document.createElement('input');
            input.type = 'number';
            if (!itemData[field.key] && field.default !== undefined) {
                input.value = field.default;
            }
        }
        else {
            input = document.createElement('input');
            input.type = field.type;
        }

        input.className = 'admin-field';
        input.id = 'field-' + field.key;

        let val = itemData[field.key];
        if (val === undefined || val === null) {
            val = field.default !== undefined ? field.default : '';
        }

        if (field.type === 'datetime-local' && val) {
            try {
                const d = new Date(val);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                val = d.toISOString().slice(0, 16);
            } catch(e) {}
        }

        if (field.type !== 'color' || val) {
            input.value = val;
        }

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
                '<input type="file" id="' + fileInputId + '" accept="image/*" class="hidden" data-upload-for="' + field.key + '">' +
                '<button type="button" data-upload-trigger="' + fileInputId + '" class="bg-brand-yellow/20 hover:bg-brand-yellow/30 text-brand-yellow border border-brand-yellow/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">' +
                    '<i class="fas fa-upload"></i> Enviar do Computador' +
                '</button>' +
                '<span id="' + statusId + '" class="text-[10px] text-gray-500"></span>';

            wrapper.appendChild(uploadRow);

            setTimeout(() => {
                const fileInput = document.getElementById(fileInputId);
                const trigger = uploadRow.querySelector('[data-upload-trigger]');
                const statusEl = document.getElementById(statusId);

                if (trigger && fileInput) {
                    trigger.addEventListener('click', () => fileInput.click());
                }

                if (fileInput) {
                    fileInput.addEventListener('change', async (ev) => {
                        const file = ev.target.files && ev.target.files[0];
                        if (!file) return;

                        const setStatus = (msg, color) => {
                            if (statusEl) {
                                statusEl.textContent = msg;
                                statusEl.style.color = color || '#9ca3af';
                            }
                        };

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
            preview.onerror = () => { preview.classList.add('hidden'); };

            const updatePreview = (url) => {
                if (url && url.trim()) {
                    preview.src = window.optimizeImage ? window.optimizeImage(url, 600) : url;
                    preview.classList.remove('hidden');
                } else {
                    preview.classList.add('hidden');
                }
            };

            updatePreview(input.value);
            input.addEventListener('input', (e) => updatePreview(e.target.value));
            wrapper.appendChild(preview);
        }

        container.appendChild(wrapper);
    });

    if (tab === 'avisos') {
        const previewSection = document.createElement('div');
        previewSection.className = 'mt-6 pt-6 border-t border-white/10';
        previewSection.innerHTML =
            '<h4 class="text-sm font-bold text-brand-yellow mb-3">' +
                '<i class="fas fa-eye mr-2"></i> Preview do Aviso' +
            '</h4>' +
            '<div class="preview-aviso-box" id="preview-aviso-box">' +
                '<div class="preview-aviso-content" id="preview-aviso-content">' +
                    '<div class="preview-aviso-subtitle" id="preview-aviso-subtitle"></div>' +
                    '<div class="preview-aviso-title" id="preview-aviso-title">Título do Aviso</div>' +
                    '<div class="preview-aviso-desc" id="preview-aviso-desc"></div>' +
                '</div>' +
            '</div>';
        container.appendChild(previewSection);

        const style = document.createElement('style');
        style.textContent =
            '.preview-aviso-box {' +
                'position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #0f172a; background-size: cover; background-position: center; border: 2px solid rgba(255,255,255,0.1); margin-top: 8px;' +
            '}' +
            '.preview-aviso-content {' +
                'position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 20px;' +
            '}' +
            '.preview-aviso-content.pos-left { align-items: flex-start; text-align: left; padding-left: 24px; }' +
            '.preview-aviso-content.pos-center { align-items: center; text-align: center; }' +
            '.preview-aviso-content.pos-right { align-items: flex-end; text-align: right; padding-right: 24px; }' +
            '.preview-aviso-subtitle { font-size: 10px; color: #EEBC5A; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px; }' +
            '.preview-aviso-title { font-size: 20px; font-weight: 900; color: #fff; line-height: 1.1; text-transform: uppercase; margin-bottom: 6px; }' +
            '.preview-aviso-desc { font-size: 11px; color: rgba(255,255,255,0.9); line-height: 1.4; max-width: 90%; }' +
            '.preview-aviso-box::before { content: ""; position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%); pointer-events: none; }';
        container.appendChild(style);

        const updateAvisoPreview = () => {
            const bg = document.getElementById('preview-aviso-box');
            const content = document.getElementById('preview-aviso-content');
            const subtitleEl = document.getElementById('preview-aviso-subtitle');
            const titleEl = document.getElementById('preview-aviso-title');
            const descEl = document.getElementById('preview-aviso-desc');

            const imageUrl = document.getElementById('field-imageUrl')?.value || '';
            const bgColor = document.getElementById('field-bgColor')?.value || '#0f172a';
            const textColor = document.getElementById('field-textColor')?.value || '#ffffff';
            const position = document.getElementById('field-position')?.value || 'center';
            const subtitle = document.getElementById('field-subtitle')?.value || '';
            const title = document.getElementById('field-title')?.value || 'Título do Aviso';
            const desc = document.getElementById('field-description')?.value || '';

            if (imageUrl && imageUrl.trim()) {
                const imgUrl = window.optimizeImage ? window.optimizeImage(imageUrl, 1200) : imageUrl;
                bg.style.backgroundImage = 'url(' + imgUrl + ')';
            } else {
                bg.style.backgroundImage = 'none';
                bg.style.background = bgColor;
            }

            content.className = 'preview-aviso-content pos-' + position;

            subtitleEl.textContent = subtitle;
            subtitleEl.style.display = subtitle ? 'block' : 'none';
            titleEl.textContent = title;
            titleEl.style.color = textColor;
            descEl.textContent = desc;
            descEl.style.color = textColor;
            descEl.style.display = desc ? 'block' : 'none';
        };

        ['field-imageUrl', 'field-bgColor', 'field-textColor', 'field-position', 'field-subtitle', 'field-title', 'field-description'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', updateAvisoPreview);
                el.addEventListener('change', updateAvisoPreview);
            }
        });

        setTimeout(updateAvisoPreview, 100);
    }

    modal.classList.remove('hidden');
};

window.closeEditModal = () => {
    document.getElementById('edit-item-modal').classList.add('hidden');
};

// ============================================================
// SALVAR ITEM
// ✅ Chama notifyDataChanged() ao final
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
        if (el) {
            newData[field.key] = el.value;
        }
    });

    const payload = {
        sheet: tab,
        action: mode,
        password: window.adminState.password,
        data: newData
    };

    if (mode === 'edit') {
        payload.originalId = btn.dataset.originalId;
    }

    try {
        const res = await fetch(window.CONFIG.scriptUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (window.handleServerAuthError(result)) {
            btn.disabled = false;
            btn.textContent = 'Salvar';
            return;
        }

        if (result.success) {
            if (mode === 'edit' && index !== null && index !== undefined) {
                window.adminState.currentData[index] = newData;
            } else {
                window.adminState.currentData.push(newData);
            }

            try {
                localStorage.setItem('admin_' + tab, JSON.stringify({
                    timestamp: Date.now(),
                    content: window.adminState.currentData
                }));
            } catch(e) {}

            window.renderAdminTable(window.adminState.currentData, tab);

            // ✅ Notifica outras abas + recarrega localmente
            window.notifyDataChanged();

            alert('Salvo com sucesso!');
            window.closeEditModal();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch(e) {
        alert('Erro de conexão: ' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Salvar';
    }
};

// ============================================================
// DELETAR ITEM
// ✅ Chama notifyDataChanged() ao final
// ============================================================
window.deleteAdminItem = async (index) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const tab = window.adminState.currentTab;
    const item = window.adminState.currentData[index];
    // ✅ Usa a coluna "id" real
    const originalId = item.id || '';

    if (!originalId) {
        alert('Este item não tem ID. Rode setupPlanilha() no Apps Script para adicionar a coluna id.');
        return;
    }

    try {
        const res = await fetch(window.CONFIG.scriptUrl, {
            method: 'POST',
            body: JSON.stringify({
                sheet: tab,
                action: 'delete',
                password: window.adminState.password,
                originalId: originalId,
                data: {}
            })
        });
        const result = await res.json();

        if (window.handleServerAuthError(result)) return;

        if (result.success) {
            alert('Excluído com sucesso!');
            window.adminState.currentData.splice(index, 1);

            try {
                localStorage.setItem('admin_' + tab, JSON.stringify({
                    timestamp: Date.now(),
                    content: window.adminState.currentData
                }));
            } catch(e) {}

            window.renderAdminTable(window.adminState.currentData, tab);

            // ✅ Notifica outras abas + recarrega localmente
            window.notifyDataChanged();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch(e) {
        alert('Erro: ' + e.message);
    }
};

// ============================================================
// LOG
// ============================================================
console.log('🔐 admin.js carregado (com upload ImgBB + notifyDataChanged)');
