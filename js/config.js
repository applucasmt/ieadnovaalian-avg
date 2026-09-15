// ============================================================
// IEAD NOVA ALIANÇA - CONFIGURAÇÕES GLOBAIS
// ============================================================

window.CONFIG = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbxfp4FgLF0s_6UNQ8MrU3EBeJvCMLvS92xpLZ-HeO7H0FPlEtkSd_DWsGw4FJxC0hJ_ag/exec',
    youtubeKey: 'AIzaSyAov1GBz0bCyGsBLUkT6qjDPzT5TZbHrf8',
    youtubeChannel: 'UCEhO2WiTY8qy_cBoQpwoJjQ',
    cacheTime: 3600000
};

window.ADMIN_PASSWORD_LOCAL = "12345";

window.globalEvents = [];
window.isMarketingAnimating = false;

window.adminState = {
    isAuthenticated: false,
    password: '',
    currentTab: 'eventos',
    currentData: []
};

// ============================================================
// OTIMIZAÇÃO DE IMAGENS
// ============================================================
window.optimizeImage = (url, width) => {
    width = width || 800;
    if (!url || typeof url !== 'string') return url;
    if (url.indexOf('wsrv.nl') !== -1) return url;
    if (url.indexOf('.webp') !== -1) return url;
    if (url.indexOf('http') === 0) {
        const encoded = encodeURIComponent(url.replace(/^https?:\/\//, ''));
        return 'https://wsrv.nl/?url=' + encoded + '&w=' + width + '&q=75&output=webp&we=1&il';
    }
    return url;
};

// ============================================================
// PARSER DE DATAS ROBUSTO
// ============================================================
window.parseDate = (dateStr) => {
    if(!dateStr) return new Date();
    if(dateStr instanceof Date) return dateStr;
    
    const str = String(dateStr).trim();
    
    // Formato ISO: 2026-01-31T19:00:00 ou 2026-01-31 19:00:00
    let m = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
        return new Date(
            parseInt(m[1]), 
            parseInt(m[2]) - 1, 
            parseInt(m[3]), 
            parseInt(m[4] || 0), 
            parseInt(m[5] || 0), 
            parseInt(m[6] || 0)
        );
    }
    
    // Formato BR: 31/01/2026 19:00:00
    m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
        return new Date(
            parseInt(m[3]), 
            parseInt(m[2]) - 1, 
            parseInt(m[1]), 
            parseInt(m[4] || 0), 
            parseInt(m[5] || 0), 
            parseInt(m[6] || 0)
        );
    }
    
    // Fallback
    const d = new Date(str);
    if(!isNaN(d.getTime())) return d;
    
    return new Date();
};

// ============================================================
// TOAST
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
// BASE64
// ============================================================
window.toBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => resolve(fr.result.split(',')[1]);
        fr.onerror = reject;
    });
};

console.log('⚙️ config.js carregado');
