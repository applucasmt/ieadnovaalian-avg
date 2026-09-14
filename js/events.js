// ============================================================
// IEAD NOVA ALIANÇA - EVENTOS E COMPONENTES DE CARD
// ============================================================

// ============================================================
// BADGE DE STATUS DO EVENTO
// ============================================================
window.getEventStatusBadge = (start, end) => {
    const now = new Date();
    const startDate = window.parseDate(start);
    const endDate = end ? window.parseDate(end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    if (now < startDate) {
        return '<span class="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-1 rounded border border-blue-500/30 flex items-center gap-1"><i class="far fa-clock"></i> Em Breve</span>';
    } else if (now >= startDate && now <= endDate) {
        return '<span class="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/30 flex items-center gap-1 animate-pulse"><i class="fas fa-circle text-[8px]"></i> Acontecendo Agora</span>';
    }
    return '<span class="bg-gray-500/20 text-gray-400 text-xs font-bold px-2 py-1 rounded border border-gray-500/30 flex items-center gap-1"><i class="fas fa-check"></i> Encerrado</span>';
};

// ============================================================
// CRIAR CARDS
// ============================================================
window.createCard = (data, type) => {
    
    if (type === 'evento') {
        const date = window.parseDate(data.date);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
        const statusBadge = window.getEventStatusBadge(data.date, data.endDate);
        const optimizedCover = window.optimizeImage(data.coverUrl, 600);
        
        let timeString = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (data.endDate) {
            const endTime = window.parseDate(data.endDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            timeString += ' - ' + endTime;
        }

        return '<div class="glass-panel group rounded-2xl overflow-hidden hover:-translate-y-2 active:scale-95 transition-all duration-300 flex flex-col h-full bg-brand-surface/50">' +
                    '<div class="relative w-full aspect-[4/5] overflow-hidden cursor-pointer bg-brand-dark/50" onclick="window.openEventModal(' + data._id + ')">' +
                        '<img src="' + optimizedCover + '" loading="lazy" decoding="async" onerror="this.src=\'https://placehold.co/1080x1350/1e293b/FFFFFF?text=Evento\'" class="w-full h-full object-cover">' +
                        '<div class="absolute top-4 left-4 bg-brand-dark/90 backdrop-blur-sm rounded-lg p-2 text-center min-w-[60px] border border-white/10 shadow-lg z-10">' +
                            '<span class="block text-xl font-bold text-white">' + day + '</span>' +
                            '<span class="block text-xs font-bold text-brand-yellow">' + month + '</span>' +
                        '</div>' +
                        '<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60"></div>' +
                        '<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">' +
                            '<div class="bg-black/50 backdrop-blur-md p-3 rounded-full text-white border border-white/20"><i class="fas fa-expand-alt"></i></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="p-6 flex flex-col flex-grow">' +
                        '<div class="flex justify-between items-start gap-2 mb-2">' +
                            '<h3 class="text-xl font-bold text-white line-clamp-2 group-hover:text-brand-yellow transition-colors cursor-pointer leading-tight" onclick="window.openEventModal(' + data._id + ')">' + data.name + '</h3>' +
                        '</div>' +
                        '<div class="flex flex-wrap items-center gap-2 mb-3">' +
                            statusBadge +
                            '<div class="flex items-center gap-1 text-xs text-gray-400"><i class="far fa-clock"></i><span>' + timeString + '</span></div>' +
                        '</div>' +
                        '<p class="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">' + (data.description || '') + '</p>' +
                        '<button onclick="window.openEventModal(' + data._id + ')" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-brand-yellow hover:text-brand-dark text-sm font-bold transition-all border border-white/5 active:scale-95 flex items-center justify-center gap-2">' +
                            '<i class="far fa-eye"></i> Ver Detalhes' +
                        '</button>' +
                    '</div>' +
                '</div>';
    }

    if (type === 'ministerio') {
        const optimizedCapa = window.optimizeImage(data.capa, 600);
        return '<div class="glass-panel rounded-2xl overflow-hidden group hover:border-brand-yellow/30 transition-all active:scale-95">' +
                    '<div class="relative h-56 bg-brand-dark/50">' +
                        '<img src="' + optimizedCapa + '" loading="lazy" decoding="async" onerror="this.src=\'https://placehold.co/600x400/1e293b/FFFFFF?text=Ministerio\'" class="w-full h-full object-cover">' +
                        '<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>' +
                        '<div class="absolute bottom-4 left-4"><h3 class="text-2xl font-bold text-white">' + (data.nome || '') + '</h3></div>' +
                    '</div>' +
                    '<div class="p-6">' +
                        '<div class="space-y-4 mb-6">' +
                            '<div class="flex items-start gap-3">' +
                                '<div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs mt-1 shrink-0"><i class="fas fa-crown text-brand-yellow"></i></div>' +
                                '<div><p class="text-xs text-gray-500 uppercase font-bold">Liderança</p><p class="text-sm text-gray-200">' + (data.lideres || 'A definir') + '</p></div>' +
                            '</div>' +
                            (data.regentes ? '<div class="flex items-start gap-3"><div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs mt-1 shrink-0"><i class="fas fa-users text-blue-400"></i></div><div><p class="text-xs text-gray-500 uppercase font-bold">Regentes</p><p class="text-sm text-gray-200">' + data.regentes + '</p></div></div>' : '') +
                        '</div>' +
                        (data.telefone ? '<a href="https://wa.me/55' + String(data.telefone || '').replace(/\D/g,'') + '" target="_blank" class="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 py-3 rounded-xl font-bold transition-all duration-300"><i class="fab fa-whatsapp"></i> Entrar em Contato</a>' : '') +
                    '</div>' +
                '</div>';
    }

    if (type === 'talento') {
        const optimizedCapa = window.optimizeImage(data.capa, 600);
        return '<div class="glass-panel rounded-2xl overflow-hidden group hover:border-brand-yellow/30 transition-all active:scale-95 flex flex-col h-full">' +
                    '<div class="relative h-64 sm:h-72 bg-brand-dark/50">' +
                        '<img src="' + optimizedCapa + '" loading="lazy" decoding="async" onerror="this.src=\'https://placehold.co/600x400/1e293b/FFFFFF?text=Talento\'" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">' +
                        '<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>' +
                        '<div class="absolute bottom-4 left-4 right-4">' +
                            '<h3 class="text-2xl font-bold text-white mb-1 drop-shadow-lg">' + (data.nome || '') + '</h3>' +
                            '<div class="h-1 w-12 bg-brand-yellow rounded-full"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="p-6 flex flex-col flex-grow">' +
                        '<p class="text-gray-300 text-sm mb-6 flex-grow leading-relaxed">' + (data.descricao || 'Sem descrição.') + '</p>' +
                        '<div class="flex flex-col gap-3">' +
                            (data.video ? '<a href="' + data.video + '" target="_blank" class="flex items-center justify-center gap-2 w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20 py-3 rounded-xl font-bold transition-all duration-300"><i class="fab fa-youtube"></i> Ver Vídeo</a>' : '') +
                            (data.telefone ? '<a href="https://wa.me/55' + String(data.telefone || '').replace(/\D/g,'') + '" target="_blank" class="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 py-3 rounded-xl font-bold transition-all duration-300"><i class="fab fa-whatsapp"></i> Contato</a>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>';
    }
    
    if (type === 'album') {
        const optimizedCover = window.optimizeImage(data.coverImageUrl, 500);
        return '<a href="' + data.albumUrl + '" target="_blank" class="glass-panel rounded-2xl overflow-hidden group block relative aspect-square active:scale-95 transition-transform bg-brand-dark/50">' +
                    '<img src="' + optimizedCover + '" loading="lazy" decoding="async" onerror="this.src=\'https://placehold.co/400x400/1e293b/FFFFFF?text=Galeria\'" class="w-full h-full object-cover">' +
                    '<div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">' +
                        '<div class="text-center p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">' +
                            '<i class="fas fa-images text-3xl text-brand-yellow mb-2"></i>' +
                            '<h3 class="font-bold text-white text-lg">' + (data.albumName || '') + '</h3>' +
                            '<p class="text-sm text-gray-300 mt-1">Ver fotos</p>' +
                        '</div>' +
                    '</div>' +
                '</a>';
    }
    
    return '';
};

// ============================================================
// HELPER: ESCAPAR HTML
// ============================================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================
// HELPER: VERIFICAR SE É URL VÁLIDA
// ============================================================
function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed === '') return false;
    return /^https?:\/\/.+\..+/i.test(trimmed);
}

// ============================================================
// RENDERIZAR CARROSSEL DE AVISOS
// ============================================================
window.renderAvisosCarousel = (avisos) => {
    console.log('🎬 renderAvisosCarousel chamado com:', avisos);
    
    const carousel = document.getElementById('avisos-carousel');
    const slidesContainer = document.getElementById('avisos-slides');
    const dotsContainer = document.getElementById('aviso-dots');
    
    if (!carousel || !slidesContainer || !dotsContainer) {
        console.warn('❌ Elementos do carrossel não encontrados no DOM');
        return;
    }
    
    // Filtra apenas ativos
    const activeAvisos = (avisos || []).filter(a => {
        if (!a) return false;
        
        if (a.active !== undefined && a.active !== '' && a.active !== null) {
            const activeStr = String(a.active).toLowerCase();
            if (activeStr === 'false' || activeStr === '0' || activeStr === 'nao' || activeStr === 'não') {
                return false;
            }
        }
        
        return a.title || a.texto || a.description;
    });
    
    console.log('✅ Avisos ativos:', activeAvisos.length);
    
    if (activeAvisos.length === 0) {
        carousel.classList.add('hidden');
        return;
    }
    
    // Ordena por 'order'
    activeAvisos.sort((a, b) => {
        const oa = parseInt(a.order) || 0;
        const ob = parseInt(b.order) || 0;
        return oa - ob;
    });
    
    // Mostra o carrossel
    carousel.classList.remove('hidden');
    
    if (activeAvisos.length === 1) {
        carousel.classList.add('single');
    } else {
        carousel.classList.remove('single');
    }
    
    // Imagem otimizada: sempre 1920 de largura (16:9 é baixa resolução e o cache do wsrv.nl resolve)
    const imageWidth = 1920;
    
    // Limpa containers
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // ============================================================
    // PRÉ-CARREGA TODAS AS IMAGENS ANTES DE RENDERIZAR
    // (Melhora muito o UX: nada de "carregando por partes")
    // ============================================================
    const imageUrls = activeAvisos.map(a => {
        if (!isValidImageUrl(a.imageUrl)) return null;
        const rawUrl = a.imageUrl.trim();
        return window.optimizeImage ? window.optimizeImage(rawUrl, imageWidth) : rawUrl;
    });
    
    // Inicia o pré-carregamento em paralelo
    imageUrls.forEach(url => {
        if (url) {
            const img = new Image();
            img.src = url;
        }
    });
    
    // Renderiza cada slide
    activeAvisos.forEach((aviso, index) => {
        const slide = document.createElement('div');
        slide.className = 'aviso-slide';
        slide.dataset.index = index;
        
        const bgColor = (aviso.bgColor && aviso.bgColor.trim()) ? aviso.bgColor : '#0f172a';
        slide.style.backgroundColor = bgColor;
        
        if (isValidImageUrl(aviso.imageUrl)) {
            const rawUrl = aviso.imageUrl.trim();
            const imgUrl = window.optimizeImage ? window.optimizeImage(rawUrl, imageWidth) : rawUrl;
            
            slide.style.backgroundImage = 'url(' + imgUrl + ')';
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center';
        } else {
            slide.classList.add('no-image');
        }
        
        const content = document.createElement('div');
        const position = aviso.position || 'center';
        const align = aviso.align || 'center';
        
        content.className = 'aviso-content pos-' + position;
        
        if (position === 'custom') {
            const posX = parseFloat(aviso.posX) || 50;
            const posY = parseFloat(aviso.posY) || 50;
            content.style.setProperty('--aviso-x', posX + '%');
            content.style.setProperty('--aviso-y', posY + '%');
            content.style.setProperty('--aviso-align', align);
        }
        
        const textColor = (aviso.textColor && aviso.textColor.trim()) ? aviso.textColor : '#ffffff';
        content.style.color = textColor;
        
        let contentHTML = '';
        
        if (aviso.subtitle && aviso.subtitle.trim()) {
            contentHTML += '<div class="aviso-subtitle">' + escapeHtml(aviso.subtitle.trim()) + '</div>';
        }
        
        const title = aviso.title || aviso.texto || 'Aviso';
        contentHTML += '<h2 class="aviso-title" style="color: ' + textColor + '">' + escapeHtml(title) + '</h2>';
        
        if (aviso.description && aviso.description.trim()) {
            contentHTML += '<p class="aviso-description" style="color: ' + textColor + '">' + escapeHtml(aviso.description.trim()) + '</p>';
        }
        
        if (aviso.buttonText && aviso.buttonText.trim() && aviso.buttonUrl && aviso.buttonUrl.trim()) {
            contentHTML += '<a href="' + escapeHtml(aviso.buttonUrl.trim()) + '" class="aviso-button"' +
                (aviso.buttonUrl.trim().startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '') +
                '>' + escapeHtml(aviso.buttonText.trim()) + ' <i class="fas fa-arrow-right"></i></a>';
        }
        
        content.innerHTML = contentHTML;
        slide.appendChild(content);
        slidesContainer.appendChild(slide);
        
        // Dot
        const dot = document.createElement('button');
        dot.className = 'aviso-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Ir para aviso ' + (index + 1));
        dot.dataset.index = index;
        dot.onclick = () => goToAviso(index);
        dotsContainer.appendChild(dot);
    });
    
    // Estado
    let currentIndex = 0;
    let autoplayTimer = null;
    let progressTimer = null;
    const AUTOPLAY_DELAY = 6000;
    
    const slides = slidesContainer.querySelectorAll('.aviso-slide');
    const dots = dotsContainer.querySelectorAll('.aviso-dot');
    
    if (slides.length > 0) {
        slides[0].classList.add('active');
    }
    
    const goToAviso = (index) => {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
        
        currentIndex = index;
        resetProgress();
    };
    
    function resetProgress() {
        dots.forEach(d => d.style.setProperty('--progress', '0%'));
        
        if (progressTimer) clearInterval(progressTimer);
        
        const activeDot = dots[currentIndex];
        if (!activeDot) return;
        
        let progress = 0;
        const step = 100 / (AUTOPLAY_DELAY / 50);
        
        progressTimer = setInterval(() => {
            progress += step;
            if (progress >= 100) progress = 100;
            activeDot.style.setProperty('--progress', progress + '%');
        }, 50);
    }
    
    const nextAviso = () => goToAviso(currentIndex + 1);
    const prevAviso = () => goToAviso(currentIndex - 1);
    
    function startAutoplay() {
        stopAutoplay();
        if (slides.length < 2) return;
        
        resetProgress();
        autoplayTimer = setInterval(() => {
            goToAviso(currentIndex + 1);
        }, AUTOPLAY_DELAY);
    }
    
    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
        if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
        }
    }
    
    startAutoplay();
    
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    
    const prevBtn = document.getElementById('aviso-prev');
    const nextBtn = document.getElementById('aviso-next');
    
    if (prevBtn) {
        prevBtn.onclick = () => {
            stopAutoplay();
            prevAviso();
            startAutoplay();
        };
    }
    if (nextBtn) {
        nextBtn.onclick = () => {
            stopAutoplay();
            nextAviso();
            startAutoplay();
        };
    }
    
    // Swipe
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextAviso();
            else prevAviso();
        }
        
        startAutoplay();
    }, { passive: true });
};

// ============================================================
// MODAL DE DETALHES DO EVENTO
// ============================================================
window.openEventModal = (eventId) => {
    const event = window.globalEvents.find(e => e._id === eventId);
    if (!event) return;

    const modal = document.getElementById('event-modal');
    const img = document.getElementById('modal-img');
    const dateEl = document.getElementById('modal-date').querySelector('span');
    const timeEl = document.getElementById('modal-time').querySelector('span');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');

    img.src = window.optimizeImage(event.coverUrl, 1000) || 'https://placehold.co/600x400/1e293b/FFFFFF?text=Evento';
    img.onerror = () => img.src = 'https://placehold.co/600x400/1e293b/FFFFFF?text=Evento';
    
    let dateObj = window.parseDate(event.date);
    
    dateEl.textContent = dateObj.toLocaleDateString('pt-BR', { 
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
    });
    timeEl.textContent = dateObj.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', minute: '2-digit' 
    }) + 'h';
    
    title.textContent = event.name;
    desc.textContent = event.description || 'Sem descrição adicional.';

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('modal-content-box').classList.remove('scale-95');
        document.getElementById('modal-content-box').classList.add('scale-100');
    }, 10);
    
    document.body.style.overflow = 'hidden';
};

window.closeEventModal = () => {
    const modal = document.getElementById('event-modal');
    modal.classList.add('opacity-0');
    
    const box = document.getElementById('modal-content-box');
    if (box) {
        box.classList.add('scale-95');
        box.classList.remove('scale-100');
    }
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!document.getElementById('event-modal').classList.contains('hidden')) {
            window.closeEventModal();
        }
        if (!document.getElementById('admin-modal').classList.contains('hidden')) {
            window.closeAdmin();
        }
        if (!document.getElementById('edit-item-modal').classList.contains('hidden')) {
            window.closeEditModal();
        }
        if (document.getElementById('ebd-login-modal') && !document.getElementById('ebd-login-modal').classList.contains('hidden')) {
            window.ebd.toggleLoginModal();
        }
        if (document.getElementById('marketing-modal') && !document.getElementById('marketing-modal').classList.contains('hidden')) {
            window.closeMarketingModal();
        }
    }
});

console.log('📅 events.js carregado (com carrossel de avisos)');
