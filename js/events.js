// ============================================================
// IEAD NOVA ALIANÇA - EVENTOS E COMPONENTES DE CARD
// ============================================================

// ============================================================
// BADGE DE STATUS DO EVENTO (Em Breve / Acontecendo / Encerrado)
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
// CRIAR CARDS (aviso, evento, ministério, talento, álbum)
// ============================================================
window.createCard = (data, type) => {
    
    // ============================================================
    // AVISO
    // ============================================================
    if (type === 'aviso') {
        return '<div class="glass-panel p-6 rounded-xl border-l-4 border-brand-yellow hover:bg-white/5 transition-all duration-300 active:scale-95"><div class="flex items-start gap-4"><i class="fas fa-bullhorn text-brand-yellow text-xl mt-1"></i><p class="text-gray-200 leading-relaxed text-sm sm:text-base">' + (data.texto || '') + '</p></div></div>';
    }

    // ============================================================
    // EVENTO
    // ============================================================
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

    // ============================================================
    // MINISTÉRIO
    // ============================================================
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

    // ============================================================
    // TALENTO
    // ============================================================
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
    
    // ============================================================
    // ÁLBUM (Galeria)
    // ============================================================
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

    // Imagem em alta qualidade para o modal
    img.src = window.optimizeImage(event.coverUrl, 1000) || 'https://placehold.co/600x400/1e293b/FFFFFF?text=Evento';
    img.onerror = () => img.src = 'https://placehold.co/600x400/1e293b/FFFFFF?text=Evento';
    
    let dateObj = window.parseDate(event.date);
    
    dateEl.textContent = dateObj.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    timeEl.textContent = dateObj.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
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

// ============================================================
// FECHAR MODAL DE EVENTO
// ============================================================
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

// ============================================================
// FECHAR MODAIS COM ESC
// ============================================================
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
    }
});

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('📅 events.js carregado');
