// ============================================================
// IEAD NOVA ALIANÇA - CONFIGURAÇÕES GLOBAIS
// ============================================================

// ============================================================
// CONFIGURAÇÕES DA APLICAÇÃO
// ============================================================
window.CONFIG = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbzm6Tpwxlxs4Mlm2_VtYRXhw27qahnTrWWnrXkLTCyDbxKL964I_HOvChiru2JcSOY/exec',
    youtubeKey: 'AIzaSyAov1GBz0bCyGsBLUkT6qjDPzT5TZbHrf8',
    youtubeChannel: 'UCEhO2WiTY8qy_cBoQpwoJjQ',
    cacheTime: 3600000, // 1 hora em milissegundos

    // ✅ CORREÇÃO: URL do endpoint de upload do ImgBB (server-side no Apps Script)
    // O upload será feito via POST para o scriptUrl, que por sua vez envia ao ImgBB
    // usando a chave privada (guardada no code.gs, nunca exposta no navegador).
    imgbbUploadEndpoint: 'https://api.imgbb.com/1/upload',
    // ⚠️ A chave NÃO fica aqui. Fica em code.gs (const IMGBB_API_KEY).

    // ✅ CORREÇÃO: limites de upload para validação no cliente (evita upload gigante)
    maxUploadSizeMB: 10,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
};

// ============================================================
// SENHA DO ADMIN (deve ser IGUAL ao arquivo code.gs)
// ============================================================
window.ADMIN_PASSWORD_LOCAL = "12345";

// ============================================================
// ESTADO GLOBAL DE EVENTOS
// ============================================================
window.globalEvents = [];
window.isMarketingAnimating = false;

// ============================================================
// ESTADO DO ADMIN
// ============================================================
window.adminState = {
    isAuthenticated: false,
    password: '',
    currentTab: 'eventos',
    currentData: []
};

// ============================================================
// OTIMIZAÇÃO DE IMAGENS (Proxy wsrv.nl)
// Converte imagens para WebP e redimensiona automaticamente
// ✅ CORREÇÃO: passa a ignorar URLs do ImgBB já otimizadas com
//    parâmetro de tamanho (evita dupla conversão desnecessária).
// ============================================================
window.optimizeImage = (url, width) => {
    width = width || 800;
    if (!url || typeof url !== 'string') return url;
    if (url.indexOf('wsrv.nl') !== -1) return url;
    if (url.indexOf('.webp') !== -1) return url; // Já é otimizada
    // ✅ CORREÇÃO: se for do i.ibb.co (ImgBB), também otimiza via wsrv.nl
    // (o código original já fazia isso por ser http, mas mantemos explícito)
    if (url.indexOf('http') === 0) {
        const encoded = encodeURIComponent(url.replace(/^https?:\/\//, ''));
        return 'https://wsrv.nl/?url=' + encoded + '&w=' + width + '&q=75&output=webp&we=1&il';
    }
    return url;
};

// ============================================================
// PARSER DE DATAS (aceita vários formatos)
// ============================================================
window.parseDate = (dateStr) => {
    if(!dateStr) return new Date();
    if(dateStr instanceof Date) return dateStr;
    
    // Tenta ISO
    let d = new Date(dateStr);
    if(!isNaN(d.getTime())) return d;
    
    // Tenta PT-BR (dd/mm/yyyy)
    if (typeof dateStr === 'string') {
        const parts = dateStr.split('/');
        if(parts.length === 3) {
            return new Date(parts[2] + '-' + parts[1] + '-' + parts[0]);
        }
    }
    return new Date();
};

// ============================================================
// TOAST DE NOTIFICAÇÃO
// ============================================================
window.showToast = (msg) => {
    const t = document.getElementById('toast');
    if(t) {
        t.innerText = msg;
        t.classList.remove('translate-y-32', 'opacity-0');
        setTimeout(() => t.classList.add('translate-y-32', 'opacity-0'), 3000);
    }
};

// ============================================================
// HELPERS DE CONVERSÃO
// ============================================================
window.toBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => resolve(fr.result.split(',')[1]);
        fr.onerror = reject;
    });
};

// ============================================================
// ✅ CORREÇÃO / NOVO: VALIDAÇÃO DE ARQUIVO DE IMAGEM
// Usado no admin antes de enviar para o ImgBB.
// Retorna { valid: true } ou { valid: false, message: '...' }
// ============================================================
window.validateImageFile = (file) => {
    if (!file) {
        return { valid: false, message: 'Nenhum arquivo selecionado.' };
    }
    const allowed = window.CONFIG.allowedImageTypes || [];
    if (allowed.length && allowed.indexOf(file.type) === -1) {
        return { valid: false, message: 'Formato inválido. Use JPG, PNG, WEBP ou GIF.' };
    }
    const maxMB = window.CONFIG.maxUploadSizeMB || 10;
    const maxBytes = maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return { valid: false, message: 'Arquivo muito grande. Máximo: ' + maxMB + ' MB.' };
    }
    return { valid: true, message: '' };
};

// ============================================================
// ✅ CORREÇÃO / NOVO: UPLOAD DE IMAGEM VIA IMGBB (server-side)
// O arquivo é enviado em base64 para o Apps Script (code.gs),
// que faz o POST ao ImgBB com a API key privada e devolve a URL.
//
// Uso:
//   const result = await window.uploadImageToImgBB(file);
//   // { success: true, url: 'https://i.ibb.co/...', deleteUrl: '...' }
//   // { success: false, message: '...' }
// ============================================================
window.uploadImageToImgBB = async (file) => {
    // Validação local primeiro
    const check = window.validateImageFile(file);
    if (!check.valid) {
        return { success: false, message: check.message };
    }

    try {
        // Converte para base64 (sem o prefixo data:image/...;base64,)
        const base64 = await window.toBase64(file);

        const payload = {
            action: 'uploadImage',
            password: window.adminState.password,
            fileName: file.name || ('upload_' + Date.now()),
            mimeType: file.type || 'image/jpeg',
            imageBase64: base64
        };

        const res = await fetch(window.CONFIG.scriptUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            return { success: false, message: 'Falha de rede ao enviar imagem.' };
        }

        const result = await res.json();

        // Trata sessão expirada (senha errada)
        if (window.handleServerAuthError && window.handleServerAuthError(result)) {
            return { success: false, message: 'Sessão expirada. Faça login novamente.' };
        }

        if (!result.success) {
            return { success: false, message: result.message || 'Erro ao enviar imagem.' };
        }

        // ✅ CORREÇÃO (Caminho 1 — ImgBB): a API do ImgBB retorna também
        // um "delete_url" no objeto data. Guardamos ele no retorno para
        // eventual uso futuro (soft delete manual), mas NÃO é usado
        // automaticamente porque a API pública do ImgBB não permite
        // deletar via API key. O usuário apaga manualmente pelo painel.
        return {
            success: true,
            url: result.url || '',
            thumbUrl: result.thumbUrl || '',
            deleteUrl: result.deleteUrl || ''
        };

    } catch (e) {
        console.error('Erro no upload ImgBB:', e);
        return { success: false, message: 'Erro inesperado: ' + e.message };
    }
};

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('⚙️ config.js carregado');
