// ============================================================
// IEAD NOVA ALIANÇA - PAINEL ADMIN
// ============================================================

window.SCHEMAS = {
    eventos: [
        { key: 'name', label: 'Nome do Evento', type: 'text' },
        { key: 'date', label: 'Data Início', type: 'datetime-local' },
        { key: 'endDate', label: 'Data Fim (Opcional)', type: 'datetime-local' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'coverUrl', label: 'URL da Capa', type: 'text' }
    ],
    
    // ============================================================
    // AVISOS - CARROSSEL
    // ============================================================
    avisos: [
        { key: 'title', label: '📝 Título do Aviso (opcional)', type: 'text' },
        { key: 'subtitle', label: 'Subtítulo (linha acima do título)', type: 'text' },
        { key: 'description', label: 'Descrição (texto abaixo do título)', type: 'textarea' },
        { key: 'imageUrl', label: '🖼️ URL da Imagem de Fundo (opcional)', type: 'text', hint: 'Deixe vazio para usar só cor de fundo' },
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
        { key: 'capa', label: 'URL da Foto', type: 'text' }
    ],
    talentos: [
        { key: 'nome', label: 'Nome', type: 'text' },
        { key: 'descricao', label: 'Descrição', type: 'textarea' },
        { key: 'telefone', label: 'Whatsapp', type: 'text' },
        { key: 'video', label: 'Link YouTube', type: 'text' },
        { key: 'capa', label: 'URL da Foto', type: 'text' }
    ],
    albuns: [
        { key: 'albumName', label: 'Nome do Álbum', type: 'text' },
        { key: 'coverImageUrl', label: 'URL da Capa', type: 'text' },
        { key: 'albumUrl', label: 'Link do Álbum', type: 'text' }
    ],
    pastor: [
        { key: 'nome', label: 'Nome', type: 'text' },
        { key: 'capa', label: 'URL da Foto', type: 'text' }
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
// CARREGAR ABA (CORRIGIDO - SEM CACHE, COM DEBUG)
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
        // SEMPRE busca dados frescos (ignora cache)
        const url = window.CONFIG.scriptUrl + '?sheet=' + tab + '&cacheBust=' + Date.now();
        
        console.log('🔄 Buscando dados da aba "' + tab + '":', url);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        
        const data = await res.json();
        
        console.log('📦 Dados recebidos da aba "' + tab + '":', data);
        
        if (data && data.error) {
            throw new Error(data.error);
        }
        
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
            // Garante que é array
            const dataArray = Array.isArray(data) ? data : [];
            window.adminState.currentData = dataArray;
            
            // Salva no cache local para fallback
            try {
                localStorage.setItem('admin_' + tab, JSON.stringify({
                    timestamp: Date.now(),
                    content: dataArray
                }));
            } catch(e) {}
            
            window.renderAdminTable(dataArray, tab);
        }
    } catch (e) {
        console.error('❌ Erro ao carregar aba "' + tab + '":', e);
        contentArea.innerHTML = '<p class="text-red-400 text-center py-10">Erro ao carregar dados: ' + e.message + '</p>';
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

    // Detecta a chave principal de exibição
    let displayKey = Object.keys(data[0])[0];
    if (data[0].name) displayKey = 'name';
    if (data[0].nome) displayKey = 'nome';
    if (data[0].titulo) displayKey = 'titulo';
    if (data[0].texto) displayKey = 'texto';
    if (data[0].title) displayKey = 'title';
    if (data[0].albumName) displayKey = 'albumName';

    let html = '<div class="grid gap-2">';
    const displayData = [...data].reverse();

    displayData.forEach((item, index) => {
        const realIndex = data.length - 1 - index;
        const imgUrl = item.coverUrl || item.capa || item.coverImageUrl || item.imageUrl;
        const imgHtml = imgUrl 
            ? '<img src="' + window.optimizeImage(imgUrl, 100) + '" loading="lazy" class="w-12 h-12 object-cover rounded mr-3 bg-black/20" onerror="this.style.display=\'none\'">' 
            : '';

        // Badge de status (avisos)
        let statusBadge = '';
        if (tab === 'avisos' && item.active !== undefined) {
            const isActive = String(item.active).toLowerCase() !== 'false' && String(item.active) !== '0';
            statusBadge = isActive 
                ? '<span class="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded ml-2">ativo</span>'
                : '<span class="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded ml-2">inativo</span>';
        }

        // Nome para exibir
        let displayValue = item[displayKey];
        if (!displayValue) {
            if (item.name) displayValue = item.name;
            else if (item.nome) displayValue = item.nome;
            else if (item.title) displayValue = item.title;
            else if (item.titulo) displayValue = item.titulo;
            else if (item.texto) displayValue = item.texto;
            else if (item.albumName) displayValue = item.albumName;
            else displayValue = 'Item sem título';
        }
        
        // Trunca textos longos
        if (typeof displayValue === 'string' && displayValue.length > 60) {
            displayValue = displayValue.substring(0, 60) + '...';
        }

        html += '<div class="bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/5 hover:bg-white/10 transition-colors">' +
                    '<div class="flex items-center overflow-hidden pr-4 w-full">' +
                        imgHtml +
                        '<div class="truncate flex-1">' +
                            '<div class="flex items-center">' +
                                '<span class="font-bold text-white block truncate">' + displayValue + '</span>' +
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
            '</div>' +

            // HERO MOBILE
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2">' +
                    '<i class="fas fa-mobile-alt mr-2"></i> Foto de Fundo - Celular (Vertical)' +
                '</label>' +
                '<p class="text-[10px] text-gray-500 mb-2">Recomendado: 800x1200px (proporção 2:3)</p>' +
                '<input type="text" id="config-heroUrlMobile" class="admin-field" placeholder="https://i.ibb.co/..." value="' + heroUrlMobile + '">' +
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

    // Listeners
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
        originalId: '',
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
            
            window.applyConfigImages(newConfig[0]);
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
        itemData = window.adminState.currentData[index];
        if (itemData) {
            btn.dataset.originalId = Object.values(itemData)[0];
        }
    }
    
    console.log('✏️ Abrindo modal para', mode, 'com dados:', itemData);
    
    btn.dataset.mode = mode;
    btn.dataset.index = index;

    schema.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-1';
        
        const label = document.createElement('label');
        label.className = 'text-xs text-gray-400 font-bold uppercase';
        label.textContent = field.label;
        
        let input
