// ============================================================
// SISTEMA DE CACHE
// ============================================================
window.fetchWithCache = async (url, key, force) => {
    force = force || false;
    const cached = localStorage.getItem(key);
    
    if (!force && cached) {
        try {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < window.CONFIG.cacheTime) {
                return data.content;
            }
        } catch(e) {}
    }
    
    try {
        const response = await fetch(url + '&cacheBust=' + Date.now());
        if (!response.ok) throw new Error('Network error');
        const content = await response.json();
        try {
            localStorage.setItem(key, JSON.stringify({
                timestamp: Date.now(),
                content: content
            }));
        } catch(e) {}
        return content;
    } catch (error) {
        console.error('Erro fetch ' + key + ':', error);
        if (cached) {
            try { return JSON.parse(cached).content; } catch(e) { return []; }
        }
        return [];
    }
};

// ============================================================
// APLICAR CONFIG (LOGO + HERO + POSIÇÃO DO TEXTO)
// ============================================================
window.applyConfigImages = (config) => {
    console.log('🎨 applyConfigImages:', config);
    
    if (!config) {
        console.warn('⚠️ Config vazia');
        return;
    }
    
    // LOGO
    if (config.logoUrl && typeof config.logoUrl === 'string' && config.logoUrl.trim()) {
        const logoUrl = config.logoUrl.trim();
        const logoHeader = document.getElementById('site-logo');
        const logoFooter = document.getElementById('footer-logo');
        if (logoHeader) logoHeader.src = logoUrl;
        if (logoFooter) logoFooter.src = logoUrl;
    }
    
    // HERO
    if (config.heroUrl && typeof config.heroUrl === 'string' && config.heroUrl.trim()) {
        const heroUrl = config.heroUrl.trim();
        const hero = document.getElementById('site-hero');
        if (hero) {
            hero.src = heroUrl;
            hero.setAttribute('data-hero-url', heroUrl);
        }
    }
    
    // POSIÇÃO DO TEXTO DO HERO
    const heroContent = document.getElementById('hero-content');
    if (heroContent) {
        // Remove classes anteriores
        heroContent.classList.remove('pos-left', 'pos-center', 'pos-right', 'pos-custom');
        
        // Aplica nova posição
        const position = config.heroPosition || 'center';
        const align = config.heroAlign || 'center';
        const posX = config.heroPosX || 50;
        const posY = config.heroPosY || 50;
        
        if (position === 'custom') {
            heroContent.classList.add('pos-custom');
            heroContent.style.setProperty('--hero-x', posX + '%');
            heroContent.style.setProperty('--hero-y', posY + '%');
            heroContent.style.setProperty('--hero-align', align);
        } else {
            heroContent.classList.add('pos-' + position);
            heroContent.style.removeProperty('--hero-x');
            heroContent.style.removeProperty('--hero-y');
            heroContent.style.removeProperty('--hero-align');
        }
    }
};
