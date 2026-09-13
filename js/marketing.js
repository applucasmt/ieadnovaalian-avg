// ============================================================
// IEAD NOVA ALIANÇA - SLIDER DE MARKETING (V2)
// ============================================================

let marketingQueue = [];
let currentMarketingIndex = 0;

// ============================================================
// INICIALIZAR O SLIDER
// ============================================================
window.initMarketingSlider = (events) => {
    const queueContainer = document.getElementById('product-queue');
    if (!queueContainer) return;

    let sourceEvents = [...events];
    
    if (sourceEvents.length === 0) return;

    // Garante pelo menos 3 itens para o efeito 3D
    while (sourceEvents.length < 3) {
        sourceEvents = sourceEvents.concat(sourceEvents);
    }

    // ============================================================
    // LOG PARA DEBUG - Verificar as URLs das imagens
    // ============================================================
    console.log('🎠 Eventos no marketing:');
    sourceEvents.forEach((e, i) => {
        console.log('  [' + i + '] ' + e.name + ' → coverUrl: ' + (e.coverUrl || 'VAZIO'));
    });

    // Fila de marketing
    marketingQueue = sourceEvents.map(e => ({
        id: e._id,
        title: e.name,
        desc: e.description,
        image: e.coverUrl || ''  // Garante que seja string
    }));

    currentMarketingIndex = 0;

    renderMarketingSlider();
    updateMarketingTitle(marketingQueue[0]);
    
    const nextBtn = document.getElementById('next-marketing');
    const prevBtn = document.getElementById('prev-marketing');
    if (nextBtn) nextBtn.onclick = () => moveMarketing('next');
    if (prevBtn) prevBtn.onclick = () => moveMarketing('prev');
    
    const detailsBtn = document.getElementById('marketing-details-btn');
    if (detailsBtn) {
        detailsBtn.onclick = () => window.openMarketingModal(marketingQueue[currentMarketingIndex]);
    }
    
    updateWhatsappButton(marketingQueue[0]);

    // Clique na imagem abre o modal
    queueContainer.addEventListener('click', (e) => {
        const img = e.target.closest('.depth-layer');
        if (img && img.classList.contains('product-main')) {
            window.openMarketingModal(marketingQueue[currentMarketingIndex]);
        }
    });
};

// ============================================================
// RENDERIZAR O SLIDER
// ============================================================
function renderMarketingSlider() {
    const queueContainer = document.getElementById('product-queue');
    if (!queueContainer) return;
    
    queueContainer.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const item = marketingQueue[(currentMarketingIndex + i) % marketingQueue.length];
        if (!item) continue;
        
        const img = document.createElement('img');
        img.src = window.optimizeImage(item.image, 900);
        img.alt = item.title || 'Cartaz';
        img.className = 'depth-layer ' + (
            i === 0 ? 'product-main' : 
            i === 1 ? 'product-next' : 
            'product-next-2'
        );
        img.dataset.index = i;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.style.cursor = i === 0 ? 'pointer' : 'default';
        img.onerror = function() { 
            this.src = 'https://placehold.co/1080x1350/1e293b/FFFFFF?text=Cartaz'; 
        };
        queueContainer.appendChild(img);
    }
}

// ============================================================
// ATUALIZAR TÍTULO
// ============================================================
function updateMarketingTitle(item) {
    if (!item) return;
    
    const titleEl = document.getElementById('marketing-title-v2');
    
    if (titleEl) {
        titleEl.style.opacity = '0';
        titleEl.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            titleEl.textContent = item.title || 'Evento';
            titleEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            titleEl.style.opacity = '1';
            titleEl.style.transform = 'translateY(0)';
        }, 150);
    }
    
    updateWhatsappButton(item);
}

// ============================================================
// ATUALIZAR BOTÃO WHATSAPP
// ============================================================
function updateWhatsappButton(item) {
    const btn = document.getElementById('marketing-whatsapp-btn');
    if (btn && item) {
        const title = item.title || 'Evento';
        const text = encodeURIComponent('Paz do Senhor! Gostaria de solicitar o cartaz do evento: ' + title);
        btn.href = 'https://wa.me/5565992977124?text=' + text;
    }
}

// ============================================================
// MOVER O SLIDER
// ============================================================
window.moveMarketing = (direction) => {
    if (window.isMarketingAnimating) return;
    if (marketingQueue.length === 0) return;
    
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

    if (direction === 'next') {
        items[0].classList.replace('product-main', 'product-hidden-left');
        if (items[1]) items[1].classList.replace('product-next', 'product-main');
        if (items[2]) items[2].classList.replace('product-next-2', 'product-next');
        
        currentMarketingIndex = (currentMarketingIndex + 1) % marketingQueue.length;
        
        setTimeout(() => {
            renderMarketingSlider();
            updateMarketingTitle(marketingQueue[currentMarketingIndex]);
            window.isMarketingAnimating = false;
        }, 600);
    } else {
        currentMarketingIndex = (currentMarketingIndex - 1 + marketingQueue.length) % marketingQueue.length;
        
        const newItem = marketingQueue[currentMarketingIndex];
        const newImg = document.createElement('img');
        newImg.src = window.optimizeImage(newItem.image, 900);
        newImg.alt = newItem.title || 'Cartaz';
        newImg.className = 'depth-layer product-hidden-left';
        newImg.loading = 'lazy';
        newImg.onerror = function() { 
            this.src = 'https://placehold.co/1080x1350/1e293b/FFFFFF?text=Cartaz'; 
        };
        queueContainer.prepend(newImg);
        
        void newImg.offsetWidth;
        
        const currentItems = Array.from(queueContainer.children);
        currentItems[0].classList.replace('product-hidden-left', 'product-main');
        currentItems[1].classList.replace('product-main', 'product-next');
        if (currentItems[2]) currentItems[2].classList.replace('product-next', 'product-next-2');
        if (currentItems[3]) currentItems[3].remove();
        
        updateMarketingTitle(marketingQueue[currentMarketingIndex]);
        
        setTimeout(() => {
            window.isMarketingAnimating = false;
        }, 600);
    }
};

// ============================================================
// ABRIR MODAL DE MARKETING (com debug da imagem)
// ============================================================
window.openMarketingModal = (item) => {
    if (!item) return;
    
    const modal = document.getElementById('marketing-modal');
    const imgEl = document.getElementById('marketing-modal-img');
    const titleEl = document.getElementById('marketing-modal-title');
    const descEl = document.getElementById('marketing-modal-desc');
    const whatsappEl = document.getElementById('marketing-modal-whatsapp');
    
    // ============================================================
    // DEBUG - Verificar URL da imagem
    // ============================================================
    console.log('🖼️ Abrindo modal com:');
    console.log('   Título:', item.title);
    console.log('   Descrição:', item.desc);
    console.log('   URL da imagem (raw):', item.image);
    
    // Verifica se a URL está vazia
    if (!item.image || item.image.trim() === '') {
        console.warn('⚠️ URL da imagem está VAZIA!');
        imgEl.src = 'https://placehold.co/1080x1350/1e293b/FFFFFF?text=Sem+Imagem';
    } else {
        // Usa a URL direta sem otimização para o modal
        imgEl.src = item.image;
        console.log('   URL aplicada (direta):', item.image);
    }
    
    imgEl.onerror = () => {
        console.warn('⚠️ Erro ao carregar imagem, usando placeholder');
        imgEl.src = 'https://placehold.co/1080x1350/1e293b/FFFFFF?text=Erro+ao+Carregar';
    };
    
    titleEl.textContent = item.title || 'Evento';
    descEl.textContent = item.desc || 'Sem descrição adicional.';
    
    const title = item.title || 'Evento';
    const text = encodeURIComponent('Paz do Senhor! Gostaria de solicitar o cartaz do evento: ' + title);
    whatsappEl.href = 'https://wa.me/5565992977124?text=' + text;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
};

// ============================================================
// FECHAR MODAL
// ============================================================
window.closeMarketingModal = () => {
    const modal = document.getElementById('marketing-modal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('marketing-modal');
        if (modal && !modal.classList.contains('hidden')) {
            window.closeMarketingModal();
        }
    }
});

console.log('🎠 marketing.js V2 carregado');
