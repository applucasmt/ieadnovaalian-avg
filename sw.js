// ============================================================
// IEAD NOVA ALIANÇA - SERVICE WORKER
// ============================================================
// Estratégia: network-first para HTML/JS/CSS. Sempre busca do
// servidor quando disponível. Se a rede falhar, usa cache.
// Isso garante que atualizações chegam rápido e o site ainda
// funciona offline se preciso.
// ============================================================

const CACHE_NAME = 'iead-v1';
const CACHE_URLS = [
    './',
    './index.html',
    './css/style.css',
    './js/config.js',
    './js/data.js',
    './js/events.js',
    './js/marketing.js',
    './js/live.js',
    './js/ebd.js',
    './js/admin.js',
    './js/app.js',
    './js/scroll-reveal.js'
];

// Instala e faz cache inicial
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_URLS).catch((err) => {
                console.warn('[SW] Falha ao cachear alguns arquivos:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando...');
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
            );
        }).then(() => self.clients.claim())
    );
});

// Intercepta as requisições (network-first)
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Só intercepta GET
    if (req.method !== 'GET') return;

    // Ignora requests externos (CDN, YouTube, ImgBB, wsrv.nl, etc.)
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    // Network-first
    event.respondWith(
        fetch(req)
            .then((response) => {
                // Se deu certo, atualiza o cache com a versão nova
                if (response && response.status === 200 && response.type === 'basic') {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                }
                return response;
            })
            .catch(() => {
                // Se falhou, tenta do cache
                return caches.match(req).then((cached) => {
                    return cached || caches.match('./index.html');
                });
            })
    );
});

// Permite que a página peça pra pular a waiting e ativar a nova versão
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
