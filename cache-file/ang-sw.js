const filesToCache = [
    '.',
    'style/main.css',
    'images/still_life_medium.jpg',
    'index.html',
    'pages/offline.html',
    'pages/404.html'
];

const staticCacheName = 'pages-cache-v3';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCacheName)
        // membuka cache dengan nama staticCacheName
        // jika belum ada maka dibuat cache dgn nama tsb
        // hasilnya akan return cache
              .then(cache => {
                    return cache.addAll(filesToCache);
                    // pada cache ditambah semua file yg telah didaftarkan
              })
    );
});

self.addEventListener('activate', event => {
    //console.log('Activating service worker');
    const cacheWhitelist = [staticCacheName];
    // nama cache disimpan dalam bentuk array
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                        	if (cacheWhitelist.indexOf(cacheName) === -1) {return caches.delete(cacheName);}
                		})
            );
        })
    );
});

self.addEventListener('fetch', event => {
    //console.log('Fetch event for ', event.request.url);
    event.respondWith(
        caches.match(event.request)
        // menyesuaikan permintaan dari halaman client ke cache
              .then(response => {
                  if (response) {
                      console.log('Found ', event.request.url, ' in cache');
                      return response;
                      //jika data yg diminta ada berikan ke client
                  }
                  //console.log('Network request for ', event.request.url);
                  return fetch(event.request)
                            .then(response => {
                                if (response.status === 404) {
                                    return caches.match('pages/404.html');
                                }  
                                return caches.open(staticCacheName)
                                              .then(cache => {
                                                  cache.put(event.request.url, response.clone());
                                                  return response;
                                              });
                            });
              })
              .catch(error => {
                  console.log('Error, ', error);
                  return caches.match('pages/offline.html');
              })
    );
});