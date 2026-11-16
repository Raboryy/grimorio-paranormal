// Mude o número da versão sempre que atualizar o index.html para forçar o iPad a baixar a nova versão.
var CACHE_NAME = 'grimorio-op-v2';
var ARQUIVOS = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(ARQUIVOS.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Cache primeiro (funciona 100% offline) e atualiza em segundo plano quando há internet.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (cacheado) {
      var rede = fetch(event.request).then(function (resp) {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var copia = resp.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(event.request, copia); });
        }
        return resp;
      }).catch(function () { return cacheado; });
      return cacheado || rede;
    })
  );
});