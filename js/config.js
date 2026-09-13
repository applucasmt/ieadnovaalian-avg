// ============================================================
// CONFIGURAÇÕES GLOBAIS
// ============================================================
window.CONFIG = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbxfp4FgLF0s_6UNQ8MrU3EBeJvCMLvS92xpLZ-HeO7H0FPlEtkSd_DWsGw4FJxC0hJ_ag/exec',
    youtubeKey: 'AIzaSyAov1GBz0bCyGsBLUkT6qjDPzT5TZbHrf8',
    youtubeChannel: 'UCEhO2WiTY8qy_cBoQpwoJjQ',
    cacheTime: 3600000
};

// ============================================================
// SENHA DO ADMIN (deve ser IGUAL ao code.gs)
// ============================================================
window.ADMIN_PASSWORD_LOCAL = "12345";

// ============================================================
// ESTADO GLOBAL
// ============================================================
window.globalEvents = [];
window.isMarketingAnimating = false;

window.adminState = {
    isAuthenticated: false,
    password: '',
    currentTab: 'eventos',
    currentData: []
};

// ============================================================
// OTIMIZAÇÃO DE IMAGENS (Proxy wsrv.nl)
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
// PARSER DE DATAS
// ============================================================
window.parseDate = (dateStr) => {
    if(!dateStr) return new Date();
    if(dateStr instanceof Date) return dateStr;
    
    let d = new Date(dateStr);
    if(!isNaN(d.getTime())) return d;
    
    if (typeof dateStr === 'string') {
        const parts = dateStr.split('/');
        if(parts.length === 3) {
            return new Date(parts[2] + '-' + parts[1] + '-' + parts[0]);
        }
    }
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
