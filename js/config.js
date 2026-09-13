// ============================================================
// IEAD NOVA ALIANÇA - CONFIGURAÇÕES GLOBAIS
// ============================================================

// ============================================================
// CONFIGURAÇÕES DA APLICAÇÃO
// ============================================================
window.CONFIG = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbxfp4FgLF0s_6UNQ8MrU3EBeJvCMLvS92xpLZ-HeO7H0FPlEtkSd_DWsGw4FJxC0hJ_ag/exec',
    youtubeKey: 'AIzaSyAov1GBz0bCyGsBLUkT6qjDPzT5TZbHrf8',
    youtubeChannel: 'UCEhO2WiTY8qy_cBoQpwoJjQ',
    cacheTime: 3600000 // 1 hora em milissegundos
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
// ============================================================
window.optimizeImage = (url, width) => {
    width = width || 800;
    if (!url || typeof url !== 'string') return url;
    if (url.indexOf('wsrv.nl') !== -1) return url;
    if (url.indexOf('.webp') !== -1) return url; // Já é otimizada
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
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('⚙️ config.js carregado');
