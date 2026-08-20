/* Service worker mínimo.
 *
 * Guarda la pantalla (no los datos) para que la app abra aunque no haya señal
 * y para que Chrome la ofrezca como aplicación instalable.
 *
 * Los datos NUNCA se cachean: van siempre al servidor. Si no hay señal, la
 * app abre pero avisa que no pudo traer nada, que es mejor que mostrar
 * números viejos como si fueran de hoy.
 */
var CACHE = 'don-antonino-v2';
var ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  // todo lo que va al servidor pasa de largo
  if (e.request.method !== 'GET' || e.request.url.indexOf('script.google') >= 0) return;

  e.respondWith(
    fetch(e.request)
      .then(function (r) {
        var copia = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
        return r;
      })
      .catch(function () { return caches.match(e.request); })
  );
});
