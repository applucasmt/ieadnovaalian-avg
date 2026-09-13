// ============================================================
// IEAD NOVA ALIANÇA - MÓDULO EBD (Escola Bíblica Dominical)
// ============================================================

window.ebd = (function() {
    // ============================================================
    // CONFIGURAÇÕES
    // ============================================================
    const API_URL = "https://script.google.com/macros/s/AKfycbyZQQ8hy5GuNCR-kjnqr6rDziFi3-K7U2kwy7wmCv3gRxM5wlzlvaIMpf7Geb76psQ/exec";
    const EBD_CLASSES = ["Jardim da Infância", "Juniores", "Adolescentes", "Novos Crentes", "Jovens", "Adultos"];
    
    // ============================================================
    // ESTADO DO MÓDULO
    // ============================================================
    let currentUser = null;
    let globalTeachers = [];
    let globalSchedule = [];
    let isOffline = false;
    let editingId = null;
    
    // ============================================================
    // DADOS MOCK (usados quando offline)
    // ============================================================
    const mockT = [
        { id: 1, name: "João (Demo)", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" }
    ];
    
    const mockS = [
        { id: 1, date: "2026-02-05", teacherId: 1, title: "Exemplo", class: "Geral", cover: "https://via.placeholder.com/800", summary: "Resumo de exemplo." }
    ];

    // ============================================================
    // LOADING
    // ============================================================
    function setLoading(s) {
        const el = document.getElementById('ebd-content-area');
        if (!el) return;
        
        if (s) {
            el.innerHTML = 
                '<div class="flex flex-col items-center justify-center py-20">' +
                    '<div class="w-10 h-10 border-4 border-[#EEBC5A] border-t-transparent rounded-full animate-spin mb-4"></div>' +
                    '<p class="text-gray-500 text-xs">Carregando Escala...</p>' +
                '</div>';
        }
    }

    // ============================================================
    // STATUS DA CONEXÃO
    // ============================================================
    function updateStatus(online) {
        const el = document.getElementById('ebdConnectionStatus');
        if (!el) return;
        
        el.innerText = online ? "Conectado" : "Offline (Demo)";
        el.style.color = online ? "#46d369" : "orange";
        el.style.borderColor = online ? "#46d369" : "orange";
    }

    // ============================================================
    // BUSCAR DADOS INICIAIS
    // ============================================================
    async function fetchInitialData() {
        if (globalSchedule.length > 0 && !isOffline) {
            renderApp();
            return;
        }
        
        setLoading(true);
        
        try {
            const res = await fetch(API_URL + '?action=read', { redirect: 'follow' });
            if (!res.ok) throw new Error("Erro na rede");
            
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            globalTeachers = data.teachers || [];
            globalSchedule = data.schedule || [];
            updateStatus(true);
        } catch (e) {
            console.warn("EBD Offline fallback", e);
            globalTeachers = mockT;
            globalSchedule = mockS;
            isOffline = true;
            updateStatus(false);
        } finally {
            renderApp();
        }
    }

    // ============================================================
    // ENVIAR PARA A API
    // ============================================================
    async function sendToApi(payload) {
        // Modo offline
        if (isOffline) {
            window.showToast("Modo Offline (Simulação)");
            
            if (payload.action.indexOf('add') !== -1) payload.id = Date.now();
            if (payload.action === 'addTeacher') globalTeachers.push(payload);
            if (payload.action === 'addSchedule') globalSchedule.push(payload);
            
            if (payload.action === 'updateSchedule') {
                const idx = globalSchedule.findIndex(s => s.id == payload.id);
                if (idx !== -1) globalSchedule[idx] = Object.assign({}, globalSchedule[idx], payload);
            }
            
            if (payload.action === 'deleteSchedule') {
                globalSchedule = globalSchedule.filter(s => s.id !== payload.id);
            }
            if (payload.action === 'deleteTeacher') {
                globalTeachers = globalTeachers.filter(t => t.id !== payload.id);
            }
            
            renderApp();
            return;
        }

        setLoading(true);
        
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                redirect: "follow",
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (data.status === 'success') {
                globalTeachers = data.data.teachers;
                globalSchedule = data.data.schedule;
                renderApp();
                window.showToast("Salvo com sucesso!");
            } else {
                throw new Error(data.message);
            }
        } catch (e) {
            window.showToast("Erro ao salvar");
        } finally {
            setLoading(false);
        }
        
        renderApp();
    }

    // ============================================================
    // RENDERIZAR APP (public ou admin)
    // ============================================================
    function renderApp() {
        const el = document.getElementById('ebd-content-area');
        if (!el) return;
        
        if (currentUser === 'admin') {
            renderAdmin(el);
        } else {
            renderPublic(el);
        }
    }

    // ============================================================
    // RENDERIZAR VIEW PÚBLICA (escala de professores)
    // ============================================================
    function renderPublic(container) {
        const sorted = [...globalSchedule].sort((a, b) => {
            const dA = new Date(a.date + 'T12:00:00');
            const dB = new Date(b.date + 'T12:00:00');
            return dA - dB;
        });

        if (sorted.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10">Nenhuma escala agendada.</div>';
            return;
        }

        // Agrupa por semana
        const groups = {};
        sorted.forEach(item => {
            const dateParts = item.date.split('-');
            const dateObj = new Date(item.date + 'T12:00:00');
            const month = dateObj.toLocaleDateString('pt-BR', { month: 'long' });
            const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
            const year = dateObj.getFullYear();
            const weekNum = Math.ceil(dateParts[2] / 7);
            
            const label = weekNum + 'ª Semana de ' + monthCap + ' / ' + year;
            
            if (!groups[label]) groups[label] = [];
            groups[label].push(item);
        });

        let html = '<div class="container mx-auto px-4 py-8">' +
            '<h2 class="text-2xl font-bold text-white mb-8 pl-2 border-l-4 border-[#EEBC5A]">Escala de Professores</h2>' +
            '<div class="space-y-12">';

        for (const [label, items] of Object.entries(groups)) {
            html += '<div class="fade-in">' +
                '<h3 class="text-xl font-bold text-gray-400 mb-4 border-b border-white/10 pb-2 flex items-center gap-2">' +
                    '<i class="far fa-calendar-check text-[#EEBC5A]"></i> ' + label +
                '</h3>' +
                '<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">';
            
            items.forEach(item => {
                const dateParts = item.date.split('-');
                const dateFormatted = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
                const t = globalTeachers.find(x => x.id == item.teacherId) || { name: 'Professor', photo: '' };
                
                html += '<div class="glass-panel rounded-xl overflow-hidden flex flex-col items-center text-center p-6 border border-white/5 hover:border-[#EEBC5A]/50 transition-all group active:scale-95 relative bg-[#1e293b]/40">' +
                    '<div class="w-20 h-20 rounded-full overflow-hidden border-2 border-[#EEBC5A] mb-3 shadow-[0_0_15px_rgba(238,188,90,0.3)] bg-[#1e293b]">' +
                        '<img src="' + (window.optimizeImage(t.photo, 200) || 'https://via.placeholder.com/150') + '" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src=\'https://ui-avatars.com/api/?name=' + encodeURIComponent(t.name) + '&background=random\'">' +
                    '</div>' +
                    '<h3 class="text-base font-bold text-white mb-1 leading-tight">' + t.name + '</h3>' +
                    '<span class="text-[#EEBC5A] text-[10px] font-bold uppercase tracking-wider mb-3 block opacity-90 border border-[#EEBC5A]/30 px-2 py-0.5 rounded bg-[#EEBC5A]/10">' + (item.class || 'Geral') + '</span>' +
                    '<div class="text-gray-400 text-xs flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full">' +
                        '<i class="far fa-clock"></i>' +
                        '<span>' + dateFormatted + '</span>' +
                    '</div>' +
                '</div>';
            });
            
            html += '</div></div>';
        }
        
        html += '</div></div>';
        container.innerHTML = html;
    }

    // ============================================================
    // RENDERIZAR VIEW ADMIN (gestão)
    // ============================================================
    function renderAdmin(container) {
        const isEditing = editingId !== null;
        const editItem = isEditing ? globalSchedule.find(s => s.id === editingId) : null;

        let html = '<div class="pt-4 px-4 max-w-5xl mx-auto fade-in">' +
            '<div class="flex justify-between items-center mb-6 pb-4 border-b border-[#333]">' +
                '<h2 class="text-2xl font-bold text-white">Gestão EBD</h2>' +
                '<button onclick="window.ebd.logout()" class="text-xs font-bold text-[#EEBC5A] border border-[#EEBC5A] px-3 py-1.5 rounded hover:bg-[#EEBC5A] hover:text-brand-dark transition">SAIR</button>' +
            '</div>' +
            '<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">' +
                // Coluna 1: Formulário de escala
                '<div class="bg-[#181818] p-6 rounded border border-[#333]' + (isEditing ? ' border-l-4 border-l-blue-500' : '') + '">' +
                    '<div class="flex justify-between items-center mb-4">' +
                        '<h3 class="text-lg font-bold text-white flex items-center gap-2">' +
                            '<i class="fas ' + (isEditing ? 'fa-edit text-blue-500' : 'fa-plus-circle text-[#EEBC5A]') + '"></i> ' +
                            (isEditing ? 'Editar Escala' : 'Nova Escala') +
                        '</h3>' +
                        (isEditing ? '<button onclick="window.ebd.cancelEdit()" class="text-xs text-gray-400 hover:text-white">Cancelar</button>' : '') +
                    '</div>' +
                    '<form onsubmit="window.ebd.handleAddSchedule(event)" class="space-y-4">' +
                        '<div class="grid grid-cols-2 gap-4">' +
                            '<div>' +
                                '<label class="block text-[10px] uppercase text-gray-500 font-bold mb-1">Data</label>' +
                                '<input type="date" id="newSchedDate" class="w-full input-dark text-gray-300" required value="' + (editItem ? editItem.date : '') + '">' +
                            '</div>' +
                            '<div>' +
                                '<label class="block text-[10px] uppercase text-gray-500 font-bold mb-1">Professor</label>' +
                                '<select id="newSchedTeacher" class="w-full input-dark bg-[#333]" required>' +
                                    '<option value="">Selecione...</option>' +
                                    globalTeachers.map(t => '<option value="' + t.id + '" ' + (editItem && editItem.teacherId == t.id ? 'selected' : '') + '>' + t.name + '</option>').join('') +
                                '</select>' +
                            '</div>' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-[10px] uppercase text-[#EEBC5A] font-bold mb-1">Classe</label>' +
                            '<select id="newSchedClass" class="w-full input-dark bg-[#333]" required>' +
                                '<option value="">Selecione...</option>' +
                                EBD_CLASSES.map(c => '<option value="' + c + '" ' + (editItem && editItem.class === c ? 'selected' : '') + '>' + c + '</option>').join('') +
                            '</select>' +
                        '</div>' +
                        '<button class="w-full ' + (isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#EEBC5A] hover:bg-[#d4a040]') + ' text-white font-bold py-3 rounded mt-4 transition">' +
                            (isEditing ? 'ATUALIZAR' : 'PUBLICAR') +
                        '</button>' +
                    '</form>' +
                '</div>' +
                // Coluna 2: Professores + Escala atual
                '<div class="space-y-8">' +
                    // Novo Professor
                    '<div class="bg-[#181818] p-6 rounded border border-[#333]">' +
                        '<h3 class="text-lg font-bold text-white mb-4">Novo Professor</h3>' +
                        '<form onsubmit="window.ebd.handleAddTeacher(event)" class="flex gap-2">' +
                            '<input type="text" id="newTeacherName" placeholder="Nome" class="flex-1 input-dark" required>' +
                            '<div class="w-12 overflow-hidden relative group cursor-pointer border border-[#444] rounded bg-[#333]">' +
                                '<input type="file" id="newTeacherFile" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10">' +
                                '<div class="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-white"><i class="fas fa-camera"></i></div>' +
                            '</div>' +
                            '<button class="bg-[#333] hover:bg-[#444] text-white px-4 rounded border border-[#555]"><i class="fas fa-plus"></i></button>' +
                        '</form>' +
                        '<div class="mt-4 flex flex-wrap gap-2 max-h-40 overflow-y-auto">' +
                            globalTeachers.map(t => 
                                '<div class="bg-[#222] px-3 py-1 rounded-full border border-[#333] flex items-center gap-2 text-xs">' +
                                    '<img src="' + window.optimizeImage(t.photo, 80) + '" class="w-4 h-4 rounded-full object-cover">' +
                                    '<span class="text-gray-300">' + t.name + '</span>' +
                                    '<button onclick="window.ebd.deleteItem(\'deleteTeacher\', ' + t.id + ')" class="text-[#EEBC5A] hover:text-white ml-1">×</button>' +
                                '</div>'
                            ).join('') +
                        '</div>' +
                    '</div>' +
                    // Escala Atual
                    '<div class="bg-[#181818] p-6 rounded border border-[#333]">' +
                        '<h3 class="text-lg font-bold text-white mb-4">Escala Atual</h3>' +
                        '<div class="space-y-2 max-h-[400px] overflow-y-auto">' +
                            globalSchedule.map(s => {
                                const tName = (globalTeachers.find(t => t.id == s.teacherId) || {}).name || 'Desconhecido';
                                return '<div class="flex justify-between items-center p-3 bg-[#111] border-l-2 ' + (editingId === s.id ? 'border-blue-500 bg-blue-900/20' : 'border-[#EEBC5A]') + '">' +
                                    '<div>' +
                                        '<div class="text-[#EEBC5A] font-bold text-xs">' + s.date.split('-').reverse().join('/') + '</div>' +
                                        '<div class="text-white text-sm font-medium">' + tName + ' <span class="text-gray-500 text-xs ml-1">(' + s.class + ')</span></div>' +
                                    '</div>' +
                                    '<div class="flex gap-2">' +
                                        '<button onclick="window.ebd.editItem(' + s.id + ')" class="text-gray-400 hover:text-blue-500"><i class="fas fa-pencil-alt"></i></button>' +
                                        '<button onclick="window.ebd.deleteItem(\'deleteSchedule\', ' + s.id + ')" class="text-gray-400 hover:text-red-500"><i class="fas fa-trash"></i></button>' +
                                    '</div>' +
                                '</div>';
                            }).join('') +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
        
        container.innerHTML = html;
    }

    // ============================================================
    // EDITAR ITEM
    // ============================================================
    function editItem(id) {
        editingId = id;
        renderApp();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        editingId = null;
        renderApp();
    }

    // ============================================================
    // ADICIONAR / ATUALIZAR ESCALA
    // ============================================================
    async function handleAddSchedule(e) {
        e.preventDefault();
        
        const payload = {
            action: editingId ? 'updateSchedule' : 'addSchedule',
            id: editingId,
            date: document.getElementById('newSchedDate').value,
            teacherId: document.getElementById('newSchedTeacher').value,
            title: "Aula EBD",
            summary: "",
            link: "",
            class: document.getElementById('newSchedClass').value,
            isUpload: false,
            cover: ""
        };
        
        await sendToApi(payload);
        if (editingId) cancelEdit();
    }

    // ============================================================
    // ADICIONAR PROFESSOR
    // ============================================================
    async function handleAddTeacher(e) {
        e.preventDefault();
        
        const file = document.getElementById('newTeacherFile').files[0];
        const payload = {
            action: 'addTeacher',
            name: document.getElementById('newTeacherName').value,
            isUpload: !!file
        };
        
        if (file) {
            payload.fileName = file.name;
            payload.mimeType = file.type;
            payload.fileData = await window.toBase64(file);
        } else {
            payload.photo = "https://via.placeholder.com/150";
        }
        
        sendToApi(payload);
    }

    // ============================================================
    // DELETAR ITEM
    // ============================================================
    function deleteItem(act, id) {
        if (confirm("Apagar?")) {
            sendToApi({ action: act, id: id });
        }
    }

    // ============================================================
    // TOGGLE DO MODAL DE LOGIN
    // ============================================================
    function toggleLoginModal() {
        const m = document.getElementById('ebd-login-modal');
        if (!m) return;
        m.classList.toggle('hidden');
        m.classList.toggle('flex');
    }

    // ============================================================
    // LOGIN DO EBD
    // ============================================================
    function handleLogin(e) {
        e.preventDefault();
        
        const user = document.getElementById('ebdUsername').value;
        const pass = document.getElementById('ebdPassword').value;
        
        if (user === 'ebd2026' && pass === '2026') {
            currentUser = 'admin';
            toggleLoginModal();
            renderApp();
        } else {
            window.showToast("Senha inválida");
        }
    }

    // ============================================================
    // LOGOUT
    // ============================================================
    function logout() {
        currentUser = null;
        renderApp();
    }

    // ============================================================
    // API PÚBLICA DO MÓDULO
    // ============================================================
    return {
        fetchInitialData: fetchInitialData,
        toggleLoginModal: toggleLoginModal,
        handleLogin: handleLogin,
        logout: logout,
        handleAddSchedule: handleAddSchedule,
        handleAddTeacher: handleAddTeacher,
        deleteItem: deleteItem,
        editItem: editItem,
        cancelEdit: cancelEdit
    };
})();

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================
console.log('📚 ebd.js carregado');
