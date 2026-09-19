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
// HELPER: ESCAPAR HTML
// ============================================================
function escapeHtml(text) {
    if (text === undefined || text === null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
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
// CRIAR CARDS
// ============================================================
window.createCard = (data, type) => {
    if (!data) return '';

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

        const safeName = escapeHtml(data.name);
        const safeDesc = escapeHtml(data.description || '');

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
                            '<h3 class="text-xl font-bold text-white line-clamp-2 group-hover:text-brand-yellow transition-colors cursor-pointer leading-tight" onclick="window.openEventModal(' + data._id + ')">' + safeName + '</h3>' +
                        '</div>' +
                        '<div class="flex flex-wrap items-center gap-2 mb-3">' +
                            statusBadge +
                            '<div class="flex items-center gap-1 text-xs text-gray-400"><i class="far fa-clock"></i><span>' + timeString + '</span></div>' +
                        '</div>' +
                        '<p class="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">' + safeDesc + '</p>' +
                        '<button onclick="window.openEventModal(' + data._id + ')" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-brand-yellow hover:text-brand-dark text-sm font-bold transition-all border border-white/5 active:scale-95 flex items-center justify-center gap-2">' +
                            '<i class="far fa-eye"></i> Ver Detalhes' +
                        '</button>' +
                    '</div>' +
                '</div>';
    }

    if (type === 'ministerio') {
        const optimizedCapa = window.optimizeImage(data.capa, 600);
        const safeNome = escapeHtml(data.nome || '');
        const safeLideres = escapeHtml(data.lideres || 'A definir');
        const safeRegentes = escapeHtml(data.regentes || '');
        const safeTelefone = String(data.telefone || '').replace(/\D/g, '');

        return '<div class="glass-panel rounded-2xl overflow-hidden group hover:border-brand-yellow/30 transition-all active:scale-95">' +
                    '<div class="relative h-48 bg-brand-dark/50">' +
                        '<img src="' + optimizedCapa + '" loading="lazy" decoding="async" onerror="this.src=\'https://placehold.co/600x400/1e293b/FFFFFF?text=Ministerio\'" class="w-full h-full object-cover">' +
                        '<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>' +
                        '<div class="absolute bottom-4 left-4"><h3 class="text-xl font-bold text-white">' + safeNome + '</h3></div>' +
                    '</div>' +
                    '<div class="p-4">' +
                        '<div class="space-y-3 mb-4">' +
                            '<div class="flex items-start gap-3">' +
                                '<div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs mt-1 shrink-0"><i class="fas fa-crown text-brand-yellow"></i></div>' +
                                '<div><p class="text-[0.65rem] text-gray-500 uppercase font-bold">Liderança</p><p class="text-sm text-gray-200">' + safeLideres + '</p></div>' +
                            '</div>' +
                            (data.regentes ? '<div class="flex items-start gap-3"><div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs mt-1 shrink-0"><i class="fas fa-users text-blue-400"></i></div><div><p class="text-[0.65rem] text-gray-500 uppercase font-bold">Regentes</p><p class="text-sm text-gray-200">' + safeRegentes + '</p></div></div>' : '') +
                        '</div>' +
                        (data.telefone ? '<a href="https://wa.me/55' + safeTelefone + '" target="_blank" class="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 py-2.5 rounded-lg font-bold text-sm transition-all duration-300"><i class="fab fa-whatsapp"></i> Contato</a>' : '') +
                    '</div>' +
                '</div>';
    }

    // ============================================================
    // TALENTO
    // ============================================================
    if (type === 'talento') {
        const safeNome = escapeHtml(data.nome || '');
        const safeDescricao = escapeHtml(data.descricao || 'Sem descrição.');
        const safeTelefone = String(data.telefone || '').replace(/\D/g, '');
        const videoId = window.extractYouTubeId(data.video);
        const videoFormat = (data.videoFormat || data.videoformat || 'auto').toString().toLowerCase().trim();

        if (videoId) {
            const embedUrl = window.buildYouTubeEmbed(videoId, {
                autoplay: true, mute: true, loop: true, controls: false
            });

            let initialRatio = '16 / 9';
            if (videoFormat === 'vertical') initialRatio = '9 / 16';

            return '<div class="talent-video-card glass-panel rounded-2xl overflow-hidden group active:scale-95 transition-all flex flex-col h-full relative" ' +
                        'data-video-id="' + videoId + '" ' +
                        'data-video-format="' + videoFormat + '">' +
                        '<div class="talent-video-wrap relative w-full overflow-hidden bg-black cursor-pointer" ' +
                            'style="aspect-ratio: ' + initialRatio + ';" ' +
                            'onclick="window.openTalentVideoModal(\'' + videoId + '\', \'' + safeNome.replace(/'/g, "\\'") + '\')">' +
                            '<iframe ' +
                                'class="talent-video-iframe absolute inset-0 w-full h-full pointer-events-none" ' +
                                'src="' + embedUrl + '" ' +
                                'frameborder="0" ' +
                                'allow="autoplay; encrypted-media; picture-in-picture" ' +
                                'allowfullscreen>' +
                            '</iframe>' +
                            '<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent pointer-events-none"></div>' +
                            '<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">' +
                                '<div class="bg-brand-yellow text-brand-dark px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-2xl transform scale-95 group-hover:scale-100 transition-transform text-sm">' +
                                    '<i class="fas fa-play"></i> Assistir' +
                                '</div>' +
                            '</div>' +
                            '<div class="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">' +
                                '<h3 class="text-lg font-bold text-white mb-1 drop-shadow-lg">' + safeNome + '</h3>' +
                                '<div class="h-0.5 w-10 bg-brand-yellow rounded-full"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="p-4 flex flex-col flex-grow">' +
                            '<p class="text-gray-300 text-xs mb-4 flex-grow leading-relaxed line-clamp-3">' + safeDescricao + '</p>' +
                            '<div class="flex flex-col gap-2">' +
                                '<button onclick="window.openTalentVideoModal(\'' + videoId + '\', \'' + safeNome.replace(/'/g, "\\'") + '\')" ' +
                                    'class="flex items-center justify-center gap-2 w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20 py-2 rounded-lg font-bold text-xs transition-all duration-300">' +
                                    '<i class="fab fa-youtube"></i> Ver Vídeo' +
                                '</button>' +
                                (data.telefone ? '<a href="https://wa.me/55' + safeTelefone + '" target="_blank" class="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 py-2 rounded-lg font-bold text-xs transition-all duration-300"><i class="fab fa-whatsapp"></i> Contato</a>' : '') +
                            '</div>' +
                        '</div>' +
                    '</div>';
        }

        const optimizedCapa = window.optimizeImage(data.capa, 800);
        if (optimizedCapa) {
            return '<div class="talent-image-card glass-panel rounded-2xl overflow-hidden group hover:border-brand-yellow/30 transition-all active:scale-95 flex flex-col h-full">' +
                        '<div class="talent-image-wrap relative w-full bg-brand-dark/50 overflow-hidden">' +
                            '<img src="' + optimizedCapa + '" ' +
                                'alt="' + safeNome + '" loading="lazy" decoding="async" ' +
                                'onerror="this.src=\'https://placehold.co/600x600/1e293b/FFFFFF?text=Talento\'" ' +
                                'class="talent-image-el w-full h-full object-cover object-center">' +
                            '<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>' +
                            '<div class="absolute bottom-3 left-3 right-3">' +
                                '<h3 class="text-lg font-bold text-white mb-1 drop-shadow-lg">' + safeNome + '</h3>' +
                                '<div class="h-0.5 w-10 bg-brand-yellow rounded-full"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="p-4 flex flex-col flex-grow">' +
                            '<p class="text-gray-300 text-xs mb-4 flex-grow leading-relaxed line-clamp-3">' + safeDescricao + '</p>' +
                            '<div class="flex flex-col gap-2">' +
                                (data.telefone ? '<a href="https://wa.me/55' + safeTelefone + '" target="_blank" class="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 py-2 rounded-lg font-bold text-xs transition-all duration-300"><i class="fab fa-whatsapp"></i> Contato</a>' : '') +
                            '</div>' +
                        '</div>' +
                    '</div>';
        }

        return '<div class="glass-panel rounded-2xl overflow-hidden group hover:border-brand-yellow/30 transition-all active:scale-95 flex flex-col h-full">' +
                    '<div class="p-4 flex flex-col flex-grow">' +
                        '<h3 class="text-lg font-bold text-white mb-1">' + safeNome + '</h3>' +
                        '<div class="h-0.5 w-10 bg-brand-yellow rounded-full mb-3"></div>' +
                        '<p class="text-gray-300 text-xs mb-4 flex-grow leading-relaxed line-clamp-3">' + safeDescricao + '</p>' +
                        '<div class="flex flex-col gap-2">' +
                            (data.telefone ? '<a href="https://wa.me/55' + safeTelefone + '" target="_blank" class="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 py-2 rounded-lg font-bold text-xs transition-all duration-300"><i class="fab fa-whatsapp"></i> Contato</a>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>';
    }

    // ============================================================
    // ÁLBUM — título embaixo da imagem, clique abre grade de fotos
    // ============================================================
    if (type === 'album') {
        const optimizedCover = window.optimizeImage(data.coverImageUrl, 500);
        const safeName = escapeHtml(data.albumName || '');
        const safeUrl = escapeHtml(data.albumUrl || '#');
        const albumId = data.id || '';

        const action = 'onclick="window.openAlbumOrLink(\'' + albumId + '\', \'' + safeUrl.replace(/'/g, "\\'") + '\', \'' + safeName.replace(/'/g, "\\'") + '\'); return false;"';

        return '<a href="#" ' + action + ' class="glass-panel rounded-2xl overflow-hidden group block active:scale-95 transition-transform bg-brand-dark/50 cursor-pointer">' +
                    '<div class="relative aspect-square overflow-hidden">' +
                        '<img src="' + optimizedCover + '" loading="lazy" decoding="async" onerror="this.src=\'https://placehold.co/400x400/1e293b/FFFFFF?text=Galeria\'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">' +
                        '<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">' +
                            '<div class="bg-brand-yellow text-brand-dark px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform text-sm">' +
                                '<i class="fas fa-images"></i> Ver Fotos' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    // ✅ Título ABAIXO da imagem
                    '<div class="px-4 py-3 border-t border-white/5">' +
                        '<h3 class="font-bold text-white text-sm sm:text-base text-center leading-tight line-clamp-2 group-hover:text-brand-yellow transition-colors">' + safeName + '</h3>' +
                    '</div>' +
                '</a>';
    }

    return '';
};

// ============================================================
// ✅ ABRIR ÁLBUM — abre direto a GRADE de fotos
// ============================================================
window.openAlbumOrLink = async (albumId, albumUrl, albumName) => {
    if (!albumId) {
        if (albumUrl && albumUrl !== '#') {
            window.open(albumUrl, '_blank');
        } else {
            alert('Álbum sem fotos cadastradas.');
        }
        return;
    }

    // ✅ Abre imediatamente o modal no modo GRADE com loading
    const modal = document.getElementById('album-photos-viewer');
    if (modal) {
        window.__showAlbumView('grid');

        const titleEl = document.getElementById('album-viewer-grid-title');
        const counterEl = document.getElementById('album-viewer-grid-counter');
        const gridEl = document.getElementById('album-viewer-grid');
        if (titleEl) titleEl.textContent = albumName || 'Galeria';
        if (counterEl) counterEl.textContent = 'Carregando...';
        if (gridEl) {
            gridEl.innerHTML =
                '<div class="col-span-full text-center py-16">' +
                    '<i class="fas fa-circle-notch fa-spin text-4xl text-brand-yellow"></i>' +
                    '<p class="text-gray-400 mt-3 text-sm">Carregando fotos...</p>' +
                '</div>';
        }

        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
        document.body.style.overflow = 'hidden';
    }

    try {
        // ✅ Cache em memória por álbum — 5 minutos
        window.__albumsFotosCache = window.__albumsFotosCache || {};
        const cacheEntry = window.__albumsFotosCache[albumId];
        const CACHE_TTL = 5 * 60 * 1000;
        let fotosDoAlbum = null;

        if (cacheEntry && (Date.now() - cacheEntry.ts) < CACHE_TTL) {
            fotosDoAlbum = cacheEntry.fotos;
            console.log('⚡ Cache hit do álbum ' + albumId + ': ' + fotosDoAlbum.length + ' fotos');
        } else {
            const todasFotos = await window.fetchWithCache(
                window.CONFIG.scriptUrl + '?sheet=fotos&albumId=' + encodeURIComponent(albumId),
                'fotos_' + albumId,
                false
            );

            fotosDoAlbum = Array.isArray(todasFotos)
                ? todasFotos
                    .filter(f => String(f.albumId) === String(albumId))
                    .sort((a, b) => (parseInt(a.ordem) || 0) - (parseInt(b.ordem) || 0))
                    .map(f => f.url)
                    .filter(u => u)
                : [];

            window.__albumsFotosCache[albumId] = {
                fotos: fotosDoAlbum,
                ts: Date.now()
            };
        }

        if (fotosDoAlbum.length > 0) {
            window.openAlbumViewer(fotosDoAlbum, albumName, true);
        } else if (albumUrl && albumUrl !== '#') {
            window.closeAlbumViewer();
            window.open(albumUrl, '_blank');
        } else {
            window.closeAlbumViewer();
            alert('Este álbum não tem fotos cadastradas ainda.');
        }
    } catch (e) {
        console.error('Erro ao carregar álbum:', e);
        window.closeAlbumViewer();
        if (albumUrl && albumUrl !== '#') {
            window.open(albumUrl, '_blank');
        } else {
            alert('Erro ao carregar fotos do álbum.');
        }
    }
};

// ============================================================
// ✅ CONTROLE DE TELAS (grade ↔ lightbox)
// ============================================================
window.__showAlbumView = (view) => {
    const gridView = document.getElementById('album-viewer-grid-view');
    const lightboxView = document.getElementById('album-viewer-lightbox-view');
    const backBtn = document.getElementById('album-viewer-back');
    const modal = document.getElementById('album-photos-viewer');
    if (!gridView || !lightboxView) return;

    if (view === 'lightbox') {
        gridView.classList.add('hidden');
        lightboxView.classList.remove('hidden');
        if (backBtn) { backBtn.classList.remove('hidden'); backBtn.classList.add('flex'); }
        if (modal) modal.classList.add('album-lightbox-open');
    } else {
        gridView.classList.remove('hidden');
        lightboxView.classList.add('hidden');
        if (backBtn) { backBtn.classList.add('hidden'); backBtn.classList.remove('flex'); }
        if (modal) modal.classList.remove('album-lightbox-open');
    }
};

// ============================================================
// ✅ ABRIR O MODAL DE ÁLBUM (grade)
// ============================================================
window.openAlbumViewer = (fotos, albumName, jaAberto) => {
    const modal = document.getElementById('album-photos-viewer');
    if (!modal) return;

    if (!Array.isArray(fotos) || fotos.length === 0) {
        alert('Nenhuma foto disponível.');
        return;
    }

    window.__albumViewer = {
        fotos: fotos,
        index: 0,
        albumName: albumName || 'Galeria'
    };

    const gridTitle = document.getElementById('album-viewer-grid-title');
    const gridCounter = document.getElementById('album-viewer-grid-counter');
    if (gridTitle) gridTitle.textContent = albumName || 'Galeria';
    if (gridCounter) gridCounter.textContent = fotos.length + ' foto' + (fotos.length === 1 ? '' : 's');

    window.renderAlbumGrid();
    window.__showAlbumView('grid');

    if (!jaAberto) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
        document.body.style.overflow = 'hidden';
    }
};

// ============================================================
// ✅ RENDERIZAR A GRADE DE FOTOS
// ============================================================
window.renderAlbumGrid = () => {
    const state = window.__albumViewer;
    const gridEl = document.getElementById('album-viewer-grid');
    if (!state || !gridEl) return;

    if (state.fotos.length === 0) {
        gridEl.innerHTML =
            '<div class="col-span-full text-center py-16 text-gray-500">' +
                '<i class="fas fa-images text-5xl mb-4 opacity-30"></i>' +
                '<p>Nenhuma foto neste álbum.</p>' +
            '</div>';
        return;
    }

    gridEl.innerHTML = state.fotos.map((url, idx) => {
        return '<button onclick="window.openPhotoInLightbox(' + idx + ')" ' +
                    'class="relative aspect-square overflow-hidden rounded-lg bg-black/40 group active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-brand-yellow">' +
                    '<img src="' + window.optimizeImage(url, 400) + '" ' +
                        'loading="lazy" decoding="async" ' +
                        'class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" ' +
                        'onerror="this.style.opacity=\'0.3\'">' +
                    '<div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">' +
                        '<i class="fas fa-expand text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"></i>' +
                    '</div>' +
                '</button>';
    }).join('');
};

// ============================================================
// ✅ CLICAR NUMA FOTO DA GRADE → ABRE O LIGHTBOX
// ============================================================
window.openPhotoInLightbox = (idx) => {
    const state = window.__albumViewer;
    if (!state) return;
    if (idx < 0 || idx >= state.fotos.length) return;

    state.index = idx;
    window.__showAlbumView('lightbox');
    window.updateAlbumViewer();
};

// ============================================================
// ✅ VOLTAR DO LIGHTBOX PARA A GRADE
// ============================================================
window.backToAlbumGrid = () => {
    window.__showAlbumView('grid');
};

window.closeAlbumViewer = () => {
    const modal = document.getElementById('album-photos-viewer');
    if (!modal) return;

    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('album-lightbox-open');
        document.body.style.overflow = '';
        const imgEl = document.getElementById('album-viewer-img');
        if (imgEl) imgEl.src = '';
        window.__showAlbumView('grid');
        window.__albumViewer = null;
    }, 300);
};

// ============================================================
// ✅ ATUALIZAR O LIGHTBOX (foto individual)
// ============================================================
window.updateAlbumViewer = () => {
    const state = window.__albumViewer;
    if (!state) return;

    const img = document.getElementById('album-viewer-img');
    const counter = document.getElementById('album-viewer-counter');
    const prevBtn = document.getElementById('album-viewer-prev');
    const nextBtn = document.getElementById('album-viewer-next');
    if (!img) return;

    const url = state.fotos[state.index];

    img.style.opacity = '0.4';
    const preload = new Image();
    preload.onload = () => {
        img.src = url;
        img.style.opacity = '1';
    };
    preload.onerror = () => {
        img.src = url;
        img.style.opacity = '1';
    };
    preload.src = url;

    if (counter) counter.textContent = (state.index + 1) + ' / ' + state.fotos.length;

    const showNav = state.fotos.length > 1;
    if (prevBtn) prevBtn.style.display = showNav ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = showNav ? 'flex' : 'none';

    if (showNav) {
        const nextIdx = (state.index + 1) % state.fotos.length;
        const prevIdx = (state.index - 1 + state.fotos.length) % state.fotos.length;
        const p1 = new Image(); p1.src = state.fotos[nextIdx];
        const p2 = new Image(); p2.src = state.fotos[prevIdx];
    }
};

window.nextAlbumPhoto = () => {
    const state = window.__albumViewer;
    if (!state) return;
    state.index = (state.index + 1) % state.fotos.length;
    window.updateAlbumViewer();
};

window.prevAlbumPhoto = () => {
    const state = window.__albumViewer;
    if (!state) return;
    state.index = (state.index - 1 + state.fotos.length) % state.fotos.length;
    window.updateAlbumViewer();
};

// ============================================================
// ✅ COMPARTILHAR (na GRADE e no LIGHTBOX)
// ============================================================
window.shareAlbum = async (rede) => {
    const state = window.__albumViewer;
    if (!state) return;

    const url = state.fotos[0] || '';
    const texto = '📸 ' + state.albumName + ' — Confira as fotos!';

    if (rede === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent(texto + '\n' + url), '_blank');
        return;
    }
    if (rede === 'facebook') {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'width=600,height=500');
        return;
    }
    if (rede === 'copy') {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                alert('✅ Link copiado!');
            } else {
                alert('Copie o link:\n' + url);
            }
        } catch(e) {
            alert('Copie o link:\n' + url);
        }
        return;
    }
};

window.shareAlbumPhoto = async (rede) => {
    const state = window.__albumViewer;
    if (!state) return;

    const url = state.fotos[state.index];
    if (!url) return;

    const urlCompleta = String(url);
    const texto = '📸 ' + state.albumName + ' — Confira esta foto!';

    if (rede === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent(texto + '\n' + urlCompleta), '_blank');
        return;
    }
    if (rede === 'facebook') {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(urlCompleta), '_blank', 'width=600,height=500');
        return;
    }
    if (rede === 'instagram') {
        try {
            if (navigator.clipboard) await navigator.clipboard.writeText(urlCompleta);
        } catch(e) {}
        alert('📷 Link da foto copiado!\n\nCole no Instagram para compartilhar.');
        return;
    }
    if (rede === 'copy') {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(urlCompleta);
                const btn = document.getElementById('album-viewer-copy-btn');
                if (btn) {
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check text-lg"></i><span class="hidden sm:inline">Copiado!</span>';
                    setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
                }
            } else {
                alert('Copie o link:\n' + urlCompleta);
            }
        } catch(e) {
            alert('Copie o link:\n' + urlCompleta);
        }
        return;
    }
};

// ============================================================
// TECLADO (só age no modo LIGHTBOX)
// ============================================================
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('album-photos-viewer');
    if (!modal || modal.classList.contains('hidden')) return;

    const lightboxView = document.getElementById('album-viewer-lightbox-view');
    const lightboxAberto = lightboxView && !lightboxView.classList.contains('hidden');
    if (!lightboxAberto) return;

    if (e.key === 'ArrowRight') { e.preventDefault(); window.nextAlbumPhoto(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); window.prevAlbumPhoto(); }
    if (e.key === 'Escape') { e.preventDefault(); window.backToAlbumGrid(); }
});

// ============================================================
// SWIPE (só age no modo LIGHTBOX)
// ============================================================
(function setupAlbumSwipe() {
    let touchStartX = 0;

    document.addEventListener('touchstart', (e) => {
        const modal = document.getElementById('album-photos-viewer');
        if (!modal || modal.classList.contains('hidden')) return;
        const lightboxView = document.getElementById('album-viewer-lightbox-view');
        const lightboxAberto = lightboxView && !lightboxView.classList.contains('hidden');
        if (!lightboxAberto) return;
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const modal = document.getElementById('album-photos-viewer');
        if (!modal || modal.classList.contains('hidden')) return;
        const lightboxView = document.getElementById('album-viewer-lightbox-view');
        const lightboxAberto = lightboxView && !lightboxView.classList.contains('hidden');
        if (!lightboxAberto) return;

        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) window.nextAlbumPhoto();
            else window.prevAlbumPhoto();
        }
    }, { passive: true });
})();

// ============================================================
// RENDERIZAR CARROSSEL DE AVISOS
// ============================================================
window.renderAvisosCarousel = (avisos) => {
    const carousel = document.getElementById('avisos-carousel');
    const slidesContainer = document.getElementById('avisos-slides');
    const dotsContainer = document.getElementById('aviso-dots');

    if (!carousel || !slidesContainer || !dotsContainer) return;

    if (window.__avisoAutoplayTimer) {
        clearInterval(window.__avisoAutoplayTimer);
        window.__avisoAutoplayTimer = null;
    }
    if (window.__avisoProgressTimer) {
        clearInterval(window.__avisoProgressTimer);
        window.__avisoProgressTimer = null;
    }

    const activeAvisos = (avisos || []).filter(a => {
        if (!a) return false;
        if (a.active !== undefined && a.active !== '' && a.active !== null) {
            const activeStr = String(a.active).toLowerCase();
            if (activeStr === 'false' || activeStr === '0' || activeStr === 'nao' || activeStr === 'não') {
                return false;
            }
        }
        const hasImage = isValidImageUrl(a.imageUrl);
        const hasText = Boolean(
            (a.title && String(a.title).trim()) ||
            (a.texto && String(a.texto).trim()) ||
            (a.subtitle && String(a.subtitle).trim()) ||
            (a.description && String(a.description).trim()) ||
            (a.buttonText && String(a.buttonText).trim())
        );
        return hasImage || hasText;
    });

    if (activeAvisos.length === 0) {
        carousel.classList.add('hidden');
        slidesContainer.innerHTML = '';
        dotsContainer.innerHTML = '';
        return;
    }

    activeAvisos.sort((a, b) => {
        const oa = parseInt(a.order) || 0;
        const ob = parseInt(b.order) || 0;
        return oa - ob;
    });

    carousel.classList.remove('hidden');

    if (activeAvisos.length === 1) {
        carousel.classList.add('single');
    } else {
        carousel.classList.remove('single');
    }

    const imageWidth = 1920;
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    const FALLBACK_RATIO = '16 / 9';
    const ratiosCache = {};
    const currentIndexRef = { value: 0 };

    const applyRatioToCarousel = (ratio) => {
        carousel.style.setProperty('--aviso-ratio', ratio || FALLBACK_RATIO);
    };

    applyRatioToCarousel(FALLBACK_RATIO);

    activeAvisos.forEach((a, index) => {
        if (isValidImageUrl(a.imageUrl)) {
            const rawUrl = a.imageUrl.trim();
            const imgUrl = window.optimizeImage ? window.optimizeImage(rawUrl, imageWidth) : rawUrl;
            const img = new Image();
            img.onload = () => {
                if (img.naturalWidth && img.naturalHeight) {
                    const ratio = img.naturalWidth + ' / ' + img.naturalHeight;
                    ratiosCache[index] = ratio;
                    if (index === currentIndexRef.value) applyRatioToCarousel(ratio);
                }
            };
            img.src = imgUrl;
        }
    });

    activeAvisos.forEach((aviso, index) => {
        const slide = document.createElement('div');
        slide.className = 'aviso-slide';
        slide.dataset.index = index;

        const bgColor = (aviso.bgColor && aviso.bgColor.trim()) ? aviso.bgColor : '#0f172a';
        slide.style.backgroundColor = bgColor;

        const hasImage = isValidImageUrl(aviso.imageUrl);

        if (hasImage) {
            const rawUrl = aviso.imageUrl.trim();
            const imgUrl = window.optimizeImage ? window.optimizeImage(rawUrl, imageWidth) : rawUrl;

            slide.style.backgroundImage = 'url(' + imgUrl + ')';
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center center';
            slide.style.backgroundRepeat = 'no-repeat';
            slide.style.backgroundColor = '#0f172a';
            slide.classList.add('has-image');

            if (ratiosCache[index]) {
                slide.dataset.ratio = ratiosCache[index];
            } else {
                const img = new Image();
                img.onload = () => {
                    if (img.naturalWidth && img.naturalHeight) {
                        const ratio = img.naturalWidth + ' / ' + img.naturalHeight;
                        slide.dataset.ratio = ratio;
                        ratiosCache[index] = ratio;
                        if (index === currentIndexRef.value) applyRatioToCarousel(ratio);
                    }
                };
                img.src = imgUrl;
            }
        } else {
            slide.classList.add('no-image');
            slide.dataset.ratio = FALLBACK_RATIO;
        }

        const hasTitle = aviso.title && String(aviso.title).trim();
        const hasTexto = aviso.texto && String(aviso.texto).trim();
        const hasSubtitle = aviso.subtitle && String(aviso.subtitle).trim();
        const hasDescription = aviso.description && String(aviso.description).trim();
        const hasButton = aviso.buttonText && String(aviso.buttonText).trim() && aviso.buttonUrl && String(aviso.buttonUrl).trim();

        const hasAnyText = hasTitle || hasTexto || hasSubtitle || hasDescription || hasButton;

        if (hasImage && !hasAnyText) slide.classList.add('image-only');

        if (hasAnyText) {
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

            if (hasSubtitle) contentHTML += '<div class="aviso-subtitle">' + escapeHtml(String(aviso.subtitle).trim()) + '</div>';
            if (hasTitle || hasTexto) {
                const title = hasTitle ? aviso.title : aviso.texto;
                contentHTML += '<h2 class="aviso-title" style="color: ' + textColor + '">' + escapeHtml(String(title).trim()) + '</h2>';
            }
            if (hasDescription) contentHTML += '<p class="aviso-description" style="color: ' + textColor + '">' + escapeHtml(String(aviso.description).trim()) + '</p>';
            if (hasButton) {
                contentHTML += '<a href="' + escapeHtml(String(aviso.buttonUrl).trim()) + '" class="aviso-button"' +
                    (String(aviso.buttonUrl).trim().startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '') +
                    '>' + escapeHtml(String(aviso.buttonText).trim()) + ' <i class="fas fa-arrow-right"></i></a>';
            }

            content.innerHTML = contentHTML;
            slide.appendChild(content);
        }

        slidesContainer.appendChild(slide);

        const dot = document.createElement('button');
        dot.className = 'aviso-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Ir para aviso ' + (index + 1));
        dot.dataset.index = index;
        dot.onclick = () => goToAviso(index);
        dotsContainer.appendChild(dot);
    });

    let currentIndex = 0;
    const AUTOPLAY_DELAY = 6000;

    const slides = slidesContainer.querySelectorAll('.aviso-slide');
    const dots = dotsContainer.querySelectorAll('.aviso-dot');

    if (slides.length > 0) {
        slides[0].classList.add('active');
        const firstRatio = slides[0].dataset.ratio || ratiosCache[0];
        if (firstRatio) applyRatioToCarousel(firstRatio);
    }

    const goToAviso = (index) => {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));

        currentIndex = index;
        currentIndexRef.value = index;

        const targetSlide = slides[index];
        const ratio = (targetSlide && targetSlide.dataset.ratio) || ratiosCache[index];
        if (ratio) applyRatioToCarousel(ratio);

        resetProgress();
    };

    function resetProgress() {
        dots.forEach(d => d.style.setProperty('--progress', '0%'));

        if (window.__avisoProgressTimer) {
            clearInterval(window.__avisoProgressTimer);
            window.__avisoProgressTimer = null;
        }

        const activeDot = dots[currentIndex];
        if (!activeDot) return;

        let progress = 0;
        const step = 100 / (AUTOPLAY_DELAY / 50);

        window.__avisoProgressTimer = setInterval(() => {
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
        window.__avisoAutoplayTimer = setInterval(() => {
            goToAviso(currentIndex + 1);
        }, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
        if (window.__avisoAutoplayTimer) {
            clearInterval(window.__avisoAutoplayTimer);
            window.__avisoAutoplayTimer = null;
        }
        if (window.__avisoProgressTimer) {
            clearInterval(window.__avisoProgressTimer);
            window.__avisoProgressTimer = null;
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
        if (document.getElementById('talent-video-modal') && !document.getElementById('talent-video-modal').classList.contains('hidden')) {
            window.closeTalentVideoModal();
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

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof window.adjustTalentVideoCards === 'function') {
            window.adjustTalentVideoCards();
        }
    }, 500);

    const observer = new MutationObserver(() => {
        if (typeof window.adjustTalentVideoCards === 'function') {
            window.adjustTalentVideoCards();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

console.log('📅 events.js carregado');
