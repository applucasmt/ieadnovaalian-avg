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
        
       
