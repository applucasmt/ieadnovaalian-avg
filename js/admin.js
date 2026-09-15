// ============================================================
// IEAD NOVA ALIANÇA - PAINEL ADMIN
// ============================================================

console.log('🚀 admin.js: Iniciando...');

window.SCHEMAS = {
    eventos: [
        { key: 'name', label: 'Nome do Evento', type: 'text' },
        { key: 'date', label: 'Data Início', type: 'datetime-local' },
        { key: 'endDate', label: 'Data Fim (Opcional)', type: 'datetime-local' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'coverUrl', label: 'URL da Capa', type: 'text' }
    ],
    avisos: [
        { key: 'title', label: '📝 Título do Aviso (opcional)', type: 'text' },
        { key: 'subtitle', label: 'Subtítulo', type: 'text' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'imageUrl', label: '🖼️ URL da Imagem de Fundo', type: 'text' },
        { key: 'bgColor', label: '🎨 Cor de Fundo', type: 'color', default: '#0f172a' },
        { key: 'textColor', label: '🎨 Cor do Texto', type: 'color', default: '#ffffff' },
        { key: 'buttonText', label: '🔘 Texto do Botão', type: 'text' },
        { key: 'buttonUrl', label: '🔗 Link do Botão', type: 'text' },
        { key: 'position', label: '📍 Posição', type: 'select', options: ['left', 'center', 'right', 'custom'], default: 'center' },
        { key: 'align', label: '↔️ Alinhamento (custom)', type: 'select', options: ['left', 'center', 'right'], default: 'center' },
        { key: 'posX', label: '📍 X %', type: 'number', default: 50 },
        { key: 'posY', label: '📍 Y %', type: 'number', default: 50 },
        { key: 'order', label: '🔢 Ordem', type: 'number', default: 1 },
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
    posY: 50
};

// ============================================================
// ABRIR ADMIN
// ============================================================
window.openAdmin = function() {
    console.log('🔓 openAdmin() chamado');
    
    const modal = document.getElementById('admin-modal');
    const login = document.getElementById('admin-login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    const errorMsg = document.getElementById('admin-login-error');
    
    if (!modal) {
        console.error('❌ Modal do admin não encontrado');
        alert('Erro: modal do admin não encontrado.');
        return;
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    
    if (window.adminState && window.adminState.isAuthenticated) {
        login.classList.add('hidden');
        dashboard.classList.remove('hidden');
        window.loadAdminTab('eventos');
    } else {
        login.classList.remove('hidden');
        dashboard.classList.add('hidden');
        const passInput = document.getElementById('admin-password');
        if (passInput) passInput.value = '';
        if (errorMsg) errorMsg.classList.add('hidden');
    }
};

window.closeAdmin = function() {
    const modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
};

// ============================================================
// LOGIN
// ============================================================
window.adminLogin = function() {
    const input = document.getElementById('admin-password');
    const errorMsg = document.getElementById('admin-login-error');
    const btn = document.getElementById('admin-login-btn');
    const pass = input ? input.value : '';
    
    if (errorMsg) errorMsg.classList.add('hidden');
    
    if (!pass) {
        if (errorMsg) { 
            errorMsg.textContent = 'Digite a senha.'; 
            errorMsg.classList.remove('hidden'); 
        }
        if (input) {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        }
        return;
    }
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    }
    
    const senhaCorreta = window.ADMIN_PASSWORD_LOCAL || '12345';
    
    if (pass !== senhaCorreta) {
        setTimeout(() => {
            if (errorMsg) {
                errorMsg.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> Senha incorreta. Tente novamente.';
                errorMsg.classList.remove('hidden');
            }
            if (input) {
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
                input.value = '';
                input.focus();
            }
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
            }
        }, 600);
        return;
    }
    
    window.adminState.password = pass;
    window.adminState.isAuthenticated = true;
    
    setTimeout(() => {
        document.getElementById('admin-login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        }
        if (input) input.value = '';
        window.loadAdminTab('eventos');
    }, 600);
};

window.handleServerAuthError = function(result) {
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
window.loadAdminTab = async function(tab) {
    console.log('📂 Carregando aba:', tab);
    
    window.adminState.currentTab = tab;
    
    document.querySelectorAll('.admin-tab').forEach(b => {
        if (b.dataset.tab === tab) {
            b.classList.add('active', 'bg-white/10', 'text-white');
        } else {
            b.classList.remove('active', 'bg-white/10', 'text-white');
        }
    });

    const btnNewItem = document.getElementById('btn-new-item');
    if (btnNewItem) {
        btnNewItem.style.display = (tab === 'config') ? 'none' : 'flex';
    }
    
    const contentArea = document.getElementById('admin-content-area');
    if (!contentArea) {
        console.error('❌ admin-content-area não encontrado');
        return;
    }
    
    contentArea.innerHTML = '<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-brand-yellow"></i><p class="mt-2 text-gray-400">Carregando dados...</p></div>';
    
    try {
        const url = window.CONFIG.scriptUrl + '?sheet=' + tab + '&cacheBust=' + Date.now();
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        
        const data = await res.json();
        console.log('📦 Dados da aba "' + tab + '":', data);
        
        if (data && data.error) {
            throw new Error(data.error);
        }
        
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
            const dataArray = Array.isArray(data) ? data : [];
            window.adminState.currentData = dataArray;
            
            try {
                localStorage.setItem('admin_' + tab, JSON.stringify({
                    timestamp: Date.now(),
                    content: dataArray
                }));
            } catch(e) {}
            
            window.renderAdminTable(dataArray, tab);
        }
    } catch (e) {
        console.error('❌ Erro ao carregar aba:', e);
        contentArea.innerHTML = '<p class="text-red-400 text-center py-10">Erro ao carregar dados: ' + e.message + '</p>';
    }
};

// ============================================================
// RENDERIZAR TABELA
// ============================================================
window.renderAdminTable = function(data, tab) {
    const container = document.getElementById('admin-content-area');
    if (!container) return;
    
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
    if (data[0].albumName) displayKey = 'albumName';

    let html = '<div class="grid gap-2">';
    const displayData = [...data].reverse();

    displayData.forEach((item, index) => {
        const realIndex = data.length - 1 - index;
        const imgUrl = item.coverUrl || item.capa || item.coverImageUrl || item.imageUrl;
        const imgHtml = imgUrl 
            ? '<img src="' + window.optimizeImage(imgUrl, 100) + '" loading="lazy" class="w-12 h-12 object-cover rounded mr-3 bg-black/20" onerror="this.style.display=\'none\'">' 
            : '';

        let statusBadge = '';
        if (tab === 'avisos' && item.active !== undefined) {
            const isActive = String(item.active).toLowerCase() !== 'false' && String(item.active) !== '0';
            statusBadge = isActive 
                ? '<span class="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded ml-2">ativo</span>'
                : '<span class="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded ml-2">inativo</span>';
        }

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
// RENDERIZAR CONFIG
// ============================================================
window.renderConfigForm = function(config) {
    const container = document.getElementById('admin-content-area');
    if (!container) return;
    
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
            '</div>' +
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
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-3">' +
                    '<i class="fas fa-font mr-2"></i> Textos do Hero' +
                '</label>' +
                '<div class="space-y-3">' +
                    '<div><label class="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Badge</label><input type="text" id="config-heroSubtitle" class="admin-field" value="' + heroSubtitle + '" oninput="window.updatePreviewText()"></div>' +
                    '<div><label class="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Título</label><input type="text" id="config-heroTitle" class="admin-field" value="' + heroTitle + '" oninput="window.updatePreviewText()"></div>' +
                    '<div><label class="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Descrição</label><textarea id="config-heroDescription" rows="3" class="admin-field" oninput="window.updatePreviewText()">' + heroDescription + '</textarea></div>' +
                '</div>' +
            '</div>' +
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-3">' +
                    '<i class="fas fa-arrows-alt mr-2"></i> Posição do Texto' +
                '</label>' +
                '<div class="flex gap-2 mb-4 flex-wrap">' +
                    '<button class="pos-btn ' + (currentPosition === 'left' ? 'active' : '') + '" onclick="window.setHeroPosition(\'left\')" data-pos="left"><i class="fas fa-align-left"></i> Esquerda</button>' +
                    '<button class="pos-btn ' + (currentPosition === 'center' ? 'active' : '') + '" onclick="window.setHeroPosition(\'center\')" data-pos="center"><i class="fas fa-align-center"></i> Centro</button>' +
                    '<button class="pos-btn ' + (currentPosition === 'right' ? 'active' : '') + '" onclick="window.setHeroPosition(\'right\')" data-pos="right"><i class="fas fa-align-right"></i> Direita</button>' +
                    '<button class="pos-btn ' + (currentPosition === 'custom' ? 'active' : '') + '" onclick="window.setHeroPosition(\'custom\')" data-pos="custom"><i class="fas fa-sliders-h"></i> Personalizado</button>' +
                '</div>' +
            '</div>' +
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2"><i class="fas fa-image mr-2"></i> URL da Logomarca</label>' +
                '<input type="text" id="config-logoUrl" class="admin-field" placeholder="https://i.ibb.co/..." value="' + logoUrl + '">' +
            '</div>' +
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2"><i class="fas fa-desktop mr-2"></i> Foto de Fundo - PC</label>' +
                '<input type="text" id="config-heroUrl" class="admin-field" placeholder="https://i.ibb.co/..." value="' + heroUrl + '">' +
            '</div>' +
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2"><i class="fas fa-mobile-alt mr-2"></i> Foto de Fundo - Celular</label>' +
                '<input type="text" id="config-heroUrlMobile" class="admin-field" placeholder="https://i.ibb.co/..." value="' + heroUrlMobile + '">' +
            '</div>' +
            '<div class="mt-8 pt-4 border-t border-white/10 flex justify-end">' +
                '<button onclick="window.saveConfig()" class="bg-brand-yellow text-brand-dark font-bold px-8 py-3 rounded-lg hover:bg-white transition-colors flex items-center gap-2 shadow-lg">' +
                    '<i class="fas fa-save"></i> Salvar Configurações' +
                '</button>' +
            '</div>' +
        '</div>';

    window.updateHeroPreview();
    window.updatePreviewText();
};

// ============================================================
// POSIÇÃO DO HERO
// ============================================================
window.setHeroPosition = function(position) {
    window.heroState.position = position;
    
    document.querySelectorAll('.pos-btn[data-pos]').forEach(b => {
        if (b.dataset.pos === position) b.classList.add('active');
        else b.classList.remove('active');
    });
    
    window.updateHeroPreview();
};

window.setHeroAlign = function(align) {
    window.heroState.align = align;
    window.updateHeroPreview();
};

window.updateHeroPreview = function() {
    const preview = document.getElementById('hero-preview-content');
    if (!preview) return;
    
    const position = window.heroState.position;
    const align = window.heroState.align;
    
    preview.classList.remove('preview-left', 'preview-center', 'preview-right', 'preview-custom');
    
    if (position === 'custom') {
        preview.classList.add('preview-custom');
        preview.style.setProperty('--hero-x', window.heroState.posX + '%');
        preview.style.setProperty('--hero-y', window.heroState.posY + '%');
        preview.style.setProperty('--hero-align', align);
    } else {
        preview.classList.add('preview-' + position);
    }
};

window.updatePreviewText = function() {
    const titleEl = document.getElementById('preview-title');
    const badgeEl = document.getElementById('preview-badge');
    const descEl = document.getElementById('preview-desc');
    
    const titleInput = document.getElementById('config-heroTitle');
    const subtitleInput = document.getElementById('config-heroSubtitle');
    const descInput = document.getElementById('config-heroDescription');
    
    if (titleEl && titleInput) titleEl.innerHTML = titleInput.value.replace(/\\n/g, '<br>');
    if (badgeEl && subtitleInput) badgeEl.textContent = subtitleInput.value;
    if (descEl && descInput) descEl.textContent = descInput.value;
};

// ============================================================
// SALVAR CONFIG
// ============================================================
window.saveConfig = async function() {
    const payload = {
        sheet: 'config',
        action: 'edit',
        password: window.adminState.password,
        originalId: '',
        data: {
            logoUrl: document.getElementById('config-logoUrl').value.trim(),
            heroUrl: document.getElementById('config-heroUrl').value.trim(),
            heroUrlMobile: document.getElementById('config-heroUrlMobile').value.trim(),
            heroPosition: window.heroState.position,
            heroAlign: window.heroState.align,
            heroPosX: window.heroState.posX,
            heroPosY: window.heroState.posY,
            heroTitle: document.getElementById('config-heroTitle').value,
            heroSubtitle: document.getElementById('config-heroSubtitle').value,
            heroDescription: document.getElementById('config-heroDescription').value
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
            try {
                localStorage.setItem('cache_config_v2', JSON.stringify({
                    timestamp: Date.now(),
                    content: [payload.data]
                }));
            } catch(e) {}
            
            if (typeof window.applyConfigImages === 'function') {
                window.applyConfigImages(payload.data);
            }
            alert('✅ Configurações salvas com sucesso!');
        } else {
            alert('Erro: ' + result.message);
        }
    } catch(e) {
        alert('Erro de conexão: ' + e.message);
    }
};

// ============================================================
// ABRIR MODAL DE EDIÇÃO
// ============================================================
window.openEditModal = function(mode, index) {
    console.log('✏️ openEditModal:', mode, index);
    
    const modal = document.getElementById('edit-item-modal');
    const container = document.getElementById('edit-form-container');
    const title = document.getElementById('edit-modal-title');
    const btn = document.getElementById('btn-save-item');
    
    if (!modal || !container || !title || !btn) {
        console.error('❌ Elementos do modal não encontrados');
        return;
    }
    
    const tab = window.adminState.currentTab;
    const schema = window.SCHEMAS[tab] || [];
    
    container.innerHTML = '';
    title.textContent = mode === 'add' ? 'Adicionar Novo Item' : 'Editar Item';
    
    let itemData = {};
    if (mode === 'edit' && index !== null && index !== undefined) {
        itemData = window.adminState.currentData[index] || {};
        if (itemData && Object.keys(itemData).length > 0) {
            btn.dataset.originalId = Object.values(itemData)[0];
        }
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
                if (itemData[field.key] === opt) option.selected = true;
                input.appendChild(option);
            });
        } else if (field.type === 'color') {
            input = document.createElement('input');
            input.type = 'color';
        } else if (field.type === 'number') {
            input = document.createElement('input');
            input.type = 'number';
        } else {
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
                const
