// Used similar method from previous udacity class https://classroom.udacity.com/nanodegrees/nd024/parts/0bf842e9-7269-42de-b68b-812ca7823517
// where they explain it under: introducing the service worker
// self.addEventListener('fetch', event => {
//     event.respondWith(
//         fetch(event.request)
//         // if successful return response
//         .then(response => {
//             // if path is incorrect respond with something
//             if(response.status == 404){
//                 return fetch('/img/1.jpg');
//             }
//             // if path is correct return data
//             return response;
//         })
//         // if it fails or is offline it will catch an error
//         .catch(err =>{
//             return new Response('You are offline or something went wrong');
//         })
//     );
// });

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('restaurant-stage-v1').then(cache => {
            return cache.addAll(
                [
                    '/',
                    'js/main.js',
                    '/js/restaurant_info.js',
                    '/js/dbhelper.js',
                    '/img/1.jpg',
                    '/img/2.jpg',
                    '/img/3.jpg',
                    '/img/4.jpg',
                    '/img/5.jpg',
                    '/img/6.jpg',
                    '/img/7.jpg',
                    '/img/8.jpg',
                    '/img/9.jpg',
                    '/img/10.jpg',
                    '/css/styles.css',
                    '/data/restaurants.json',
                    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
                    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
                ]
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if(response) return response;
            return fetch(event.request);
        })
    );
});