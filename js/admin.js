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
    avisos: [{ key: 'texto', label: 'Texto do Aviso', type: 'textarea' }],
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
            window.adminState.currentData = data;
            window.renderAdminTable(data, tab);
        }
    } catch (e) {
        contentArea.innerHTML = '<p class="text-red-400 text-center">Erro ao carregar dados.</p>';
    }
};

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

    let html = '<div class="grid gap-2">';
    const displayData = [...data].reverse();

    displayData.forEach((item, index) => {
        const realIndex = data.length - 1 - index;
        const imgUrl = item.coverUrl || item.capa || item.coverImageUrl;
        const imgHtml = imgUrl ? '<img src="' + window.optimizeImage(imgUrl, 100) + '" loading="lazy" class="w-12 h-12 object-cover rounded mr-3 bg-black/20" onerror="this.style.display=\'none\'">' : '';

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
                '<h3 class="text-xl font-bold
