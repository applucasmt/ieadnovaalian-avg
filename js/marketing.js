// ============================================================
// IEAD NOVA ALIANÇA - SLIDER DE MARKETING (3D CARROSSEL)
// ============================================================

// ============================================================
// FILA DE MARKETING (array com os eventos)
// ============================================================
let marketingQueue = [];

// ============================================================
// INICIALIZAR O SLIDER
// ============================================================
window.initMarketingSlider = (events) => {
    const queueContainer = document.getElementById('product-queue');
    if (!queueContainer) return;

    let sourceEvents = [...events];
    
    // Se não tem eventos, sai
    if (sourceEvents.length === 0) return;
    
    // Garante pelo menos 3 itens para o efeito 3D funcionar
    while (sourceEvents.length < 3) {
        sourceEvents = sourceEvents.concat(sourceEvents);
    }

    // Prepara a fila
    marketingQueue = sourceEvents.map(e => ({
        id: e._id,
        title: e.name,
        desc: e.description,
        image: e.coverUrl
    }));
    
    // Renderiza as 3 primeiras imagens
    queueContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        if (marketingQueue[i]) {
            const img = document.createElement('img');
            img.src = window.optimizeImage(marketingQueue[i].image, 900);
            img.className = 'depth-layer ' + (
                i === 0 ? 'product-main' : 
                i === 1 ? 'product-next' : 
                'product-next-2'
            );
            img.dataset.index = i;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.onerror = function() { 
                this.src = 'https://placehold.co/1080x1350/1e293b/FFFFFF?text=Cartaz'; 
            };
            queueContainer.appendChild(img);
        }
    }
    
    // Atualiza os textos do primeiro item
    window.updateMarketingText(marketingQueue[0]);
    
    // Configura os botões de navegação
    const nextBtn = document.getElementById('next-marketing');
    const prevBtn = document.getElementById('prev-marketing');
    
    if (nextBtn) {
        nextBtn.onclick = () => window.moveMarketing('next');
    }
    if (prevBtn) {
        prevBtn.onclick = () => window.moveMarketing('prev');
    }
    
    // Suporte a teclado (setas esquerda/direita)
    document.addEventListener('keydown', (e) => {
        const marketingPage = document.getElementById('marketing-page');
        if (!marketingPage || marketingPage.classList.contains('hidden')) return;
        
        if (e.key === 'ArrowRight') window.moveMarketing('next');
        if (e.key === 'ArrowLeft') window.moveMarketing('prev');
    });
};

// ============================================================
// ATUALIZAR TEXTOS (título, descrição e botão)
// ============================================================
window.updateMarketingText = (item) => {
    if (!item) return;
    
    const titleEl = document.getElementById('marketing-title');
    const descEl = document.getElementById('marketing-desc');
    const btnsEl = document.getElementById('marketing-btns');
    const btnAction = document.getElementById('marketing-action-btn');
    
    // Remove classe visible (faz o fade-out)
    if (titleEl) titleEl.classList.remove('visible');
    if (descEl) descEl.classList.remove('visible');
    if (btnsEl) btnsEl.classList.remove('visible');
    
    // Após 300ms, atualiza o conteúdo e faz fade-in
    setTimeout(() => {
        if (titleEl) titleEl.textContent = item.title;
        
        if (descEl) {
            descEl.textContent = (item.desc && item.desc.trim() !== '') 
                ? item.desc 
                : 'Venha participar conosco deste grande evento. Deus tem uma palavra para o seu coração.';
        }
        
        if (btnAction) {
            btnAction.onclick = () => window.openEventModal(item.id);
        }
        
        if (titleEl) titleEl.classList.add('visible');
        if (descEl) descEl.classList.add('visible');
        if (btnsEl) btnsEl.classList.add('visible');
    }, 300);
};

// ============================================================
// MOVER O SLIDER (next ou prev)
// ============================================================
window.moveMarketing = (direction) => {
    if (window.isMarketingAnimating) return;
    window.isMarketingAnimating = true;
    
    const queueContainer = document.getElementById('product-queue');
    if (!queueContainer) {
        window.isMarketingAnimating = false;
        return;
    }
    
    const items = Array.from(queueContainer.children);
    
    if (items.length < 3) {
        window.isMarketingAnimating = false;
        return;
    }

    // ============================================================
    // PRÓXIMO (avança)
    // ============================================================
    if (direction === 'next') {
        const first = marketingQueue.shift();
        marketingQueue.push(first);
        
        // Move as classes para animar
        items[0].classList.replace('product-main', 'product-hidden-left');
        if (items[1]) items[1].classList.replace('product-next', 'product-main');
        if (items[2]) items[2].classList.replace('product-next-2', 'product-next');
        
        // Após a animação, re-renderiza
        setTimeout(() => {
            queueContainer.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const img = document.createElement('img');
                img.src = window.optimizeImage(marketingQueue[i].image, 900);
                img.className = 'depth-layer ' + (
                    i === 0 ? 'product-main' : 
                    i === 1 ? 'product-next' : 
                    'product-next-2'
                );
                img.loading = 'lazy';
                img.decoding = 'async';
                img.onerror = function() { 
                    this.src = 'https://placehold.co/1080x1350/1e293b/FFFFFF?text=Cartaz'; 
                };
                queueContainer.appendChild(img);
            }
            window.updateMarketingText(marketingQueue[0]);
            window.isMarketingAnimating = false;
        }, 600);
    } 
    // ============================================================
    // ANTERIOR (volta)
    // ============================================================
    else {
        const last = marketingQueue.pop();
        marketingQueue.unshift(last);
        window.updateMarketingText(marketingQueue[0]);
        
        // Cria a imagem que vai entrar pela esquerda
        const newMain = document.createElement('img');
        newMain.src = window.optimizeImage(last.image, 900);
        newMain.className = 'depth-layer product-hidden-left';
        newMain.loading = 'lazy';
        newMain.decoding = 'async';
        newMain.onerror = function() { 
            this.src = 'https://placehold.co/1080x1350/1e293b/FFFFFF?text=Cartaz'; 
        };
        queueContainer.prepend(newMain);
        
        // Força reflow para aplicar a classe inicial
        void newMain.offsetWidth;
        
        // Agora aplica as classes de animação
        const currentItems = Array.from(queueContainer.children);
        currentItems[0].classList.replace('product-hidden-left', 'product-main');
        currentItems[1].classList.replace('product-main', 'product-next');
        if (currentItems[2]) currentItems[2].classList.replace('product-next', 'product-next-2');
        if (currentItems[3]) currentItems[3].remove();
        
        setTimeout(() => { 
            window.isMarketingAnimating = false; 
        }, 600);
    }
};

// ============================================================
// AUTO-PLAY (opcional - pode ser desativado)
// ============================================================
let autoPlayInterval = null;

window.startMarketingAutoPlay = (delay) => {
    delay = delay || 6000; // 6 segundos
    window.stopMarketingAutoPlay();
    
    autoPlayInterval = setInterval(() => {
        window.moveMarketing('next');
    }, delay);
};

window.stopMarketingAutoPlay = () => {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
};

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('🎠 marketing.js carregado');
