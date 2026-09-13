// ============================================================
// IEAD NOVA ALIANÇA - PAINEL ADMINISTRATIVO
// ============================================================

// ============================================================
// SCHEMAS DE FORMULÁRIOS (quais campos cada aba tem)
// ============================================================
window.SCHEMAS = {
    eventos: [
        { key: 'name', label: 'Nome do Evento', type: 'text' },
        { key: 'date', label: 'Data Início (AAAA-MM-DDTHH:MM)', type: 'datetime-local' },
        { key: 'endDate', label: 'Data Fim (Opcional)', type: 'datetime-local' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'coverUrl', label: 'URL da Capa (Imagem)', type: 'text' }
    ],
    avisos: [
        { key: 'texto', label: 'Texto do Aviso', type: 'textarea' }
    ],
    ministerios: [
        { key: 'nome', label: 'Nome do Ministério', type: 'text' },
        { key: 'lideres', label: 'Líderes', type: 'text' },
        { key: 'regentes', label: 'Regentes', type: 'text' },
        { key: 'telefone', label: 'Whatsapp (somente números)', type: 'text' },
        { key: 'capa', label: 'URL da Foto', type: 'text' }
    ],
    talentos: [
        { key: 'nome', label: 'Nome', type: 'text' },
        { key: 'descricao', label: 'Descrição/Função', type: 'textarea' },
        { key: 'telefone', label: 'Whatsapp', type: 'text' },
        { key: 'video', label: 'Link YouTube', type: 'text' },
        { key: 'capa', label: 'URL da Foto', type: 'text' }
    ],
    albuns: [
        { key: 'albumName', label: 'Nome do Álbum', type: 'text' },
        { key: 'coverImageUrl', label: 'URL da Capa', type: 'text' },
        { key: 'albumUrl', label: 'Link do Álbum (Google Photos/Drive)', type: 'text' }
    ],
    pastor: [
        { key: 'nome', label: 'Nome', type: 'text' },
        { key: 'capa', label: 'URL da Foto', type: 'text' }
    ]
};

// ============================================================
// ABRIR MODAL ADMIN
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

// ============================================================
// FECHAR MODAL ADMIN
// ============================================================
window.closeAdmin = () => {
    const modal = document.getElementById('admin-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
};

// ============================================================
// LOGIN DO ADMIN
// ============================================================
window.adminLogin = () => {
    const input = document.getElementById('admin-password');
    const errorMsg = document.getElementById('admin-login-error');
    const btn = document.getElementById('admin-login-btn');
    const pass = input.value;
    
    if (errorMsg) errorMsg.classList.add('hidden');
    
    if (!pass) {
        if (errorMsg) {
            errorMsg.textContent = 'Digite a senha.';
            errorMsg.classList.remove('hidden');
        }
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    
    // Validação local
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

// Detectar Enter no campo de senha
document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('admin-password');
    if (passInput) {
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.adminLogin();
            }
        });
    }
});

// ============================================================
// DETECTAR ERRO DE AUTENTICAÇÃO DO SERVIDOR
// ============================================================
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
// CARREGAR ABA DO ADMIN
// ============================================================
window.loadAdminTab = async (tab) => {
    window.adminState.currentTab = tab;
    
    // Atualiza visual das abas
    document.querySelectorAll('.admin-tab').forEach(b => {
        if (b.dataset.tab === tab) {
            b.classList.add('active', 'bg-white/10', 'text-white');
        } else {
            b.classList.remove('active', 'bg-white/10', 'text-white');
        }
    });

    // Esconde botão "Novo Item" na aba config
    const btnNewItem = document.getElementById('btn-new-item');
    if (btnNewItem) {
        if (tab === 'config') {
            btnNewItem.style.display = 'none';
        } else {
            btnNewItem.style.display = 'flex';
        }
    }
    
    const contentArea = document.getElementById('admin-content-area');
    contentArea.innerHTML = 
        '<div class="text-center py-10">' +
            '<i class="fas fa-spinner fa-spin text-3xl text-brand-yellow"></i>' +
            '<p class="mt-2 text-gray-400">Carregando dados...</p>' +
        '</div>';
    
    try {
        const data = await window.fetchWithCache(
            window.CONFIG.scriptUrl + '?sheet=' + tab,
            'admin_' + tab,
            true
        );
        
        if (tab === 'config') {
            const configData = (Array.isArray(data) && data.length > 0) ? data : [{ logoUrl: '', heroUrl: '' }];
            window.adminState.currentData = configData;
            window.renderConfigForm(configData[0]);
        } else {
            window.adminState.currentData = data;
            window.renderAdminTable(data, tab);
        }
    } catch (e) {
        contentArea.innerHTML = '<p class="text-red-400 text-center">Erro ao carregar dados.</p>';
    }
};

// ============================================================
// RENDERIZAR TABELA DO ADMIN
// ============================================================
window.renderAdminTable = (data, tab) => {
    const container = document.getElementById('admin-content-area');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-10">Nenhum item encontrado nesta aba.</p>';
        return;
    }

    // Detecta coluna de exibição
    let displayKey = Object.keys(data[0])[0];
    if (data[0].name) displayKey = 'name';
    if (data[0].nome) displayKey = 'nome';
    if (data[0].titulo) displayKey = 'titulo';
    if (data[0].texto) displayKey = 'texto';

    let html = '<div class="grid gap-2">';
    
    // Reverte ordem (último adicionado no topo)
    const displayData = [...data].reverse();

    displayData.forEach((item, index) => {
        const realIndex = data.length - 1 - index;
        const imgUrl = item.coverUrl || item.capa || item.coverImageUrl;
        const imgHtml = imgUrl 
            ? '<img src="' + window.optimizeImage(imgUrl, 100) + '" loading="lazy" decoding="async" class="w-12 h-12 object-cover rounded mr-3 bg-black/20" onerror="this.style.display=\'none\'">'
            : '';

        html += '<div class="bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/5 hover:bg-white/10 transition-colors">' +
                    '<div class="flex items-center overflow-hidden pr-4 w-full">' +
                        imgHtml +
                        '<div class="truncate">' +
                            '<span class="font-bold text-white block truncate">' + (item[displayKey] || 'Item sem título') + '</span>' +
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
// RENDERIZAR FORMULÁRIO DE CONFIG (com preview do hero)
// ============================================================
window.renderConfigForm = (config) => {
    const container = document.getElementById('admin-content-area');
    const logoUrl = config.logoUrl || '';
    const heroUrl = config.heroUrl || '';
    
    // Posição atual
    const currentPosition = config.heroPosition || 'center';
    const currentAlign = config.heroAlign || 'center';
    const currentPosX = parseFloat(config.heroPosX) || 50;
    const currentPosY = parseFloat(config.heroPosY) || 50;
    
    container.innerHTML = 
        '<div class="max-w-4xl mx-auto py-4">' +
            // Cabeçalho
            '<div class="mb-6 pb-4 border-b border-white/10">' +
                '<h3 class="text-xl font-bold text-white flex items-center gap-2">' +
                    '<i class="fas fa-palette text-brand-yellow"></i> Identidade Visual do Site' +
                '</h3>' +
                '<p class="text-xs text-gray-400 mt-1">Altere a logomarca, a foto de fundo e a posição do texto.</p>' +
            '</div>' +

            // ============================================================
            // PREVIEW DO HERO (simulação visual em tempo real)
            // ============================================================
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-3">' +
                    '<i class="fas fa-eye mr-2"></i> Pré-visualização do Hero' +
                '</label>' +
                '<div class="hero-preview-box" id="hero-preview-box" style="background-image: url(\'' + (heroUrl || '') + '\');">' +
                    '<div class="hero-preview-overlay"></div>' +
                    '<div class="hero-preview-content preview-' + currentPosition + '" id="hero-preview-content" ' +
                        (currentPosition === 'custom' ? 'style="--hero-x: ' + currentPosX + '%; --hero-y: ' + currentPosY + '%; --hero-align: ' + currentAlign + ';"' : '') + '>' +
                        '<div class="preview-badge">Bem-vindo à casa do pai</div>' +
                        '<div class="preview-title">JARDIM<br>NOVA ALIANÇA</div>' +
                        '<div class="preview-desc">Um lugar de adoração, comunhão e crescimento espiritual.</div>' +
                        '<div class="preview-buttons">' +
                            '<span class="preview-btn-1"><i class="fas fa-play" style="font-size: 0.5rem;"></i> Assistir Culto</span>' +
                            '<span class="preview-btn-2">Fale Conosco</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<p class="text-[10px] text-gray-500 mt-2 italic">Esta é uma simulação. O resultado final pode variar levemente.</p>' +
            '</div>' +

            // ============================================================
            // POSIÇÃO DO TEXTO (botões rápidos)
            // ============================================================
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-3">' +
                    '<i class="fas fa-arrows-alt mr-2"></i> Posição do Texto' +
                '</label>' +
                '<div class="flex gap-2 mb-4">' +
                    '<button class="pos-btn ' + (currentPosition === 'left' ? 'active' : '') + '" onclick="window.setHeroPosition(\'left\')">' +
                        '<i class="fas fa-align-left"></i> Esquerda' +
                    '</button>' +
                    '<button class="pos-btn ' + (currentPosition === 'center' ? 'active' : '') + '" onclick="window.setHeroPosition(\'center\')">' +
                        '<i class="fas fa-align-center"></i> Centro' +
                    '</button>' +
                    '<button class="pos-btn ' + (currentPosition === 'right' ? 'active' : '') + '" onclick="window.setHeroPosition(\'right\')">' +
                        '<i class="fas fa-align-right"></i> Direita' +
                    '</button>' +
                    '<button class="pos-btn ' + (currentPosition === 'custom' ? 'active' : '') + '" onclick="window.setHeroPosition(\'custom\')">' +
                        '<i class="fas fa-sliders-h"></i> Personalizado' +
                    '</button>' +
                '</div>' +

                // Controles personalizados (só visíveis quando "custom")
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
                        '<div class="flex gap-2">' +
                            '<button class="pos-btn ' + (currentAlign === 'left' ? 'active' : '') + '" onclick="window.setHeroAlign(\'left\')" style="font-size: 0.7rem; padding: 0.4rem;">Esquerda</button>' +
                            '<button class="pos-btn ' + (currentAlign === 'center' ? 'active' : '') + '" onclick="window.setHeroAlign(\'center\')" style="font-size: 0.7rem; padding: 0.4rem;">Centro</button>' +
                            '<button class="pos-btn ' + (currentAlign === 'right' ? 'active' : '') + '" onclick="window.setHeroAlign(\'right\')" style="font-size: 0.7rem; padding: 0.4rem;">Direita</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            // ============================================================
            // LOGO
            // ============================================================
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

            // ============================================================
            // HERO URL
            // ============================================================
            '<div class="bg-white/5 p-5 rounded-xl border border-white/10 mb-6">' +
                '<label class="block text-xs uppercase text-brand-yellow font-bold mb-2">' +
                    '<i class="fas fa-panorama mr-2"></i> URL da Foto de Fundo (Hero)' +
                '</label>' +
                '<input type="text" id="config-heroUrl" class="admin-field" placeholder="https://i.ibb.co/..." value="' + heroUrl + '" oninput="window.updateHeroPreviewImage(this.value)">' +
            '</div>' +

            // ============================================================
            // BOTÃO SALVAR
            // ============================================================
            '<div class="mt-8 pt-4 border-t border-white/10 flex justify-end">' +
                '<button onclick="window.saveConfig()" class="bg-brand-yellow text-brand-dark font-bold px-8 py-3 rounded-lg hover:bg-white transition-colors flex items-center gap-2 shadow-lg">' +
                    '<i class="fas fa-save"></i> Salvar Configurações' +
                '</button>' +
            '</div>' +
        '</div>';

    // ============================================================
    // LISTENERS DA LOGO
    // ============================================================
    const inputLogo = document.getElementById('config-logoUrl');
    const previewLogo = document.getElementById('preview-logo');
    
    if (inputLogo && previewLogo) {
        inputLogo.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) {
                previewLogo.src = url;
                previewLogo.style.display = 'block';
            } else {
                previewLogo.style.display = 'none';
            }
        });
    }
};

// ============================================================
// MUDAR POSIÇÃO DO HERO (esquerda/centro/direita/custom)
// ============================================================
window.setHeroPosition = (position) => {
    window.adminState.heroPosition = position;
    
    // Atualiza visual dos botões
    document.querySelectorAll('.pos-btn').forEach(b => {
        if (b.textContent.trim().toLowerCase().indexOf(position === 'custom' ? 'personalizado' : position) !== -1) {
            b.classList.add('active');
        }
    });
    
    // Se não é custom, remove active de outros
    if (position !== 'custom') {
        document.querySelectorAll('.pos-btn').forEach(b => {
            const txt = b.textContent.trim().toLowerCase();
            if (txt.indexOf('esquerda') !== -1 && position !== 'left') b.classList.remove('active');
            if (txt.indexOf('centro') !== -1 && position !== 'center') b.classList.remove('active');
            if (txt.indexOf('direita') !== -1 && position !== 'right') b.classList.remove('active');
            if (txt.indexOf('personalizado') !== -1) b.classList.remove('active');
        });
    }
    
    // Mostra/esconde controles custom
    const customControls = document.getElementById('custom-controls');
    if (customControls) {
        if (position === 'custom') {
            customControls.classList.remove('hidden');
        } else {
            customControls.classList.add('hidden');
        }
    }
    
    // Atualiza preview
    updateHeroPreview();
};

// ============================================================
// MUDAR ALINHAMENTO (esquerda/centro/direita)
// ============================================================
window.setHeroAlign = (align) => {
    window.adminState.heroAlign = align;
    updateHeroPreview();
};

// ============================================================
// ATUALIZAR PREVIEW DO HERO
// ============================================================
window.updateHeroPreview = () => {
    const preview = document.getElementById('hero-preview-content');
    if (!preview) return;
    
    const position = window.adminState.heroPosition || 'center';
    const align = window.adminState.heroAlign || 'center';
    
    // Remove classes antigas
    preview.classList.remove('preview-left', 'preview-center', 'preview-right', 'preview-custom');
    
    if (position === 'custom') {
        const sliderX = document.getElementById('slider-posX');
        const sliderY = document.getElementById('slider-posY');
        const posX = sliderX ? sliderX.value : 50;
        const posY = sliderY ? sliderY.value : 50;
        
        // Atualiza labels
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
    
    // Atualiza botões de alinhamento
    document.querySelectorAll('.pos-btn').forEach(b => {
        const txt = b.textContent.trim().toLowerCase();
        if (txt.indexOf('esquerda') !== -1 && txt.indexOf('texto') === -1 && align !== 'left') b.classList.remove('active');
        if (txt.indexOf('centro') !== -1 && align !== 'center') b.classList.remove('active');
        if (txt.indexOf('direita') !== -1 && align !== 'right') b.classList.remove('active');
    });
};

// ============================================================
// ATUALIZAR IMAGEM DE FUNDO DO PREVIEW
// ============================================================
window.updateHeroPreviewImage = (url) => {
    const box = document.getElementById('hero-preview-box');
    if (box && url) {
        box.style.backgroundImage = 'url(\'' + url + '\')';
    }
};

// ============================================================
// SALVAR CONFIGURAÇÕES
// ============================================================
window.saveConfig = async () => {
    const logoUrl = document.getElementById('config-logoUrl').value.trim();
    const heroUrl = document.getElementById('config-heroUrl').value.trim();
    
    // Pega posição (do state ou dos botões ativos)
    const position = window.adminState.heroPosition || 'center';
    const align = window.adminState.heroAlign || 'center';
    const sliderX = document.getElementById('slider-posX');
    const sliderY = document.getElementById('slider-posY');
    const posX = sliderX ? sliderX.value : 50;
    const posY = sliderY ? sliderY.value : 50;
    
    const payload = {
        sheet: 'config',
        action: 'edit',
        password: window.adminState.password,
        originalId: '',
        data: {
            logoUrl: logoUrl,
            heroUrl: heroUrl,
            heroPosition: position,
            heroAlign: align,
            heroPosX: posX,
            heroPosY: posY
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
            const newConfig = [{
                logoUrl: logoUrl,
                heroUrl: heroUrl,
                heroPosition: position,
                heroAlign: align,
                heroPosX: posX,
                heroPosY: posY
            }];
            
            try {
                localStorage.setItem('cache_config_v2', JSON.stringify({
                    timestamp: Date.now(),
                    content: newConfig
                }));
            } catch(e) {}
            
            window.applyConfigImages(newConfig[0]);
            alert('Configurações salvas com sucesso!');
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
        btn.dataset.originalId = Object.values(itemData)[0];
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
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }
        
        input.className = 'admin-field';
        input.id = 'field-' + field.key;
        
        let val = itemData[field.key] || '';
        if (field.type === 'datetime-local' && val) {
            try {
                const d = new Date(val);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                val = d.toISOString().slice(0, 16);
            } catch(e) {}
        }
        input.value = val;
        
        wrapper.appendChild(label);
        wrapper.appendChild(input);

        // Preview de imagem
        if (['coverUrl', 'capa', 'coverImageUrl'].indexOf(field.key) !== -1) {
            const preview = document.createElement('img');
            preview.className = 'w-full h-40 object-contain bg-black/20 rounded mt-2 border border-white/5 hidden';
            preview.onerror = () => { preview.classList.add('hidden'); };
            
            const updatePreview = (url) => {
                if (url) {
                    preview.src = window.optimizeImage(url, 600);
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
    
    modal.classList.remove('hidden');
};

// ============================================================
// FECHAR MODAL DE EDIÇÃO
// ============================================================
window.closeEditModal = () => {
    document.getElementById('edit-item-modal').classList.add('hidden');
};

// ============================================================
// SALVAR ITEM DO ADMIN
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
                localStorage.setItem('cache_' + tab + '_v2', JSON.stringify({
                    timestamp: Date.now(),
                    content: window.adminState.currentData
                }));
            } catch(e) {}

            window.renderAdminTable(window.adminState.currentData, tab);
            
            if (typeof window.loadData === 'function') {
                window.loadData();
            }

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
// DELETAR ITEM DO ADMIN
// ============================================================
window.deleteAdminItem = async (index) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    const tab = window.adminState.currentTab;
    const item = window.adminState.currentData[index];
    const originalId = Object.values(item)[0];
    
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
            window.renderAdminTable(window.adminState.currentData, tab);
            window.loadAdminTab(tab);
        } else {
            alert('Erro: ' + result.message);
        }
    } catch(e) {
        alert('Erro: ' + e.message);
    }
};

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('🔐 admin.js carregado');
