class IDBHelper {

    // creating DB keyval
    static initIdb() {
        this.dbPromise = idb.open('test-db', 3, function name(upgradeDb) {
            switch (upgradeDb.oldVersion) {
                case 0:
                    var keyValStore = upgradeDb.createObjectStore('keyval');
                    keyValStore.put('world', 'hello');
                case 1:
                    upgradeDb.createObjectStore('restaurant', { keyPath: 'id' });
                case 2:
                    upgradeDb.createObjectStore('reviews', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
            }
        });
    }

    // reviews data
    static get DATABASE_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants/`;
        // const port = 8000 // Change this to your server port
        // return `http://localhost:${port}/data/restaurants.json`;
    }

    // reviews data
    static get DATABASE_URL_REVIEWS() {
            const port = 1337; // Change this to your server port
            return `http://localhost:${port}/reviews`;
            // const port = 8000 // Change this to your server port
            // return `http://localhost:${port}/data/restaurants.json`;
        }
        // reviews by id data
    static get DATABASE_URL_REVIEWS_PER_ID() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/reviews/?restaurant_id=`;
        // const port = 8000 // Change this to your server port
        // return `http://localhost:${port}/data/restaurants.json`;
    }

    static readKeyvalDb() {
        // READ from db keyval
        this.dbPromise.then(function(db) {
            var tx = db.transaction('keyval');
            var keyValStore = tx.objectStore('keyval');
            return keyValStore.get('hello');
        }).then(function(val) {
            console.log('The value of "Hello" is: ', val);
        });
    }

    static addKeyvalObj() {
        //  add another value to objectstore
        this.dbPromise.then(function(db) {
            var tx = db.transaction('keyval', 'readwrite');
            var keyValStore = tx.objectStore('keyval');
            keyValStore.put('bar', 'foo');
            return tx.complete;
        }).then(function name(params) {
            console.log('Added foo:bar to keyval');
        });
    }

    // creates Transaction for storing restaurants
    static addRestaurantIdb(restaurantObj) {
        this.dbPromise.then(function(db) {
            var tx = db.transaction('restaurant', 'readwrite');
            var restaurantStore = tx.objectStore('restaurant');

            restaurantObj.forEach(element => {
                restaurantStore.put(element);
            });
            return tx.complete;
        }).then(function name(params) {
            console.log('Added restaurants');
        });
    }

    // creates Transaction for storing restaurants
    static addReviewsIdb(reviewObj) {
        this.dbPromise.then(function(db) {
            var tx = db.transaction('reviews', 'readwrite');
            var reviewsStore = tx.objectStore('reviews');

            reviewObj.forEach(element => {
                reviewsStore.put(element);
            });
            return tx.complete;
        }).then(function name(params) {
            console.log('Added reviews');
        });
    }

    // Read stored restaurants in restaurant DB
    static getRestaurants(callback) {
        this.dbPromise.then(function(db) {
            var tx = db.transaction('restaurant');
            var restaurantStore = tx.objectStore('restaurant');

            return restaurantStore.getAll();
        }).then(function(restaurant) {
            callback(null, restaurant);
        });
    }

    // get all the reviews
    static fetchReviews(callback) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', IDBHelper.DATABASE_URL_REVIEWS);
        xhr.onload = () => {
            if (xhr.status === 200) { // Got a success response from server!
                const json = JSON.parse(xhr.responseText);
                const reviews = json;
                IDBHelper.addReviewsIdb(reviews);
                callback(null, reviews);

            } else { // Oops!. Got an error from server.
                const error = (`Request failed. Returned status of ${xhr.status}`);
                callback(error, null);
            }
        };
        xhr.send();
    }

    static checkForConnection(callback) {
        this.dbPromise.then(db => {
            const tx = db.transaction('reviews', 'readwrite');
            return tx.objectStore('reviews').getAll();
        }).then(function(reviews) {
            callback(null, reviews);
        });
    }

    // post new review to restaurant
    static postReview(objToSend) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', IDBHelper.DATABASE_URL_REVIEWS);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(objToSend));

        this.dbPromise.then(db => {
            const tx = db.transaction('reviews', 'readwrite');
            tx.objectStore('reviews').put(objToSend);
            return tx.complete;
        });

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 0) {
                IDBHelper.postReview(objToSend);
            } else if (xhr.readyState === 4 && xhr.status === 201) {
                console.log('Added a new review');
                location.reload();
            }
        };
    }

    // Read restaurants reviews in DB
    static getReviews(callback) {
        this.dbPromise.then(function(db) {
            var tx = db.transaction('reviews');
            var reviewsStore = tx.objectStore('reviews');

            return reviewsStore.getAll();
        }).then(function(review) {
            callback(null, review);
        });
    }

    // Read stored restaurants by neighborhood in restaurant DB
    static getNeighborhood(callback) {
        IDBHelper.getRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                    // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    // Read stored restaurants by cuisine in restaurant DB
    static getCuisine(callback) {
        IDBHelper.getRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                    // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    // Get all restaurants
    static getRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        IDBHelper.getRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    // Get Image URL for restaurants
    static getImageUrlForRestaurant(restaurant) {
        return (`/img/${restaurant.photograph}.jpg`);
    }

    // Get URL for restaurants
    static getUrlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    // returns map marker for each restaurant
    static getMapMarkerForRestaurant(restaurant, map) {
        // https://leafletjs.com/reference-1.3.0.html#marker  
        const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
            title: restaurant.name,
            alt: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant)
        });
        marker.addTo(map);
        return marker;
    }

    // Get Restaurant by ID
    static getRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        IDBHelper.getRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    // Get Restaurant by ID
    static getReviewById(id, callback) {
        // fetch all restaurants with proper error handling.
        IDBHelper.getReviewsPerId(id, (error, reviews) => {
            if (error) {
                callback(error, null);
            } else {
                if (reviews) { // Got the review
                    callback(null, reviews);
                } else { // Review does not exist in the database
                    callback('Review does not exist', null);
                }
            }
        });
    }

    static getReviewsPerId(id, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', IDBHelper.DATABASE_URL_REVIEWS_PER_ID + id);
        xhr.onload = () => {
            if (xhr.status === 200) { // Got a success response from server!
                const json = JSON.parse(xhr.responseText);
                const reviews = json;
                callback(null, reviews);

            } else { // Oops!. Got an error from server.
                const error = (`Request failed. Returned status of ${xhr.status}`);
                callback(error, null);
            }
        };
        xhr.send();
    }

    static favoriteRestaurant(id, isFavorite) {
        let xhr = new XMLHttpRequest();
        xhr.open('PUT', IDBHelper.DATABASE_URL + id + '/?is_favorite=' + isFavorite, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(null);
    }
}