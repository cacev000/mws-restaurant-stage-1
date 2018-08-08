class IDBHelper {

    // creating DB keyval
    static initIdb() {
        this.dbPromise = idb.open('test-db', 2, function name(upgradeDb) {
            switch (upgradeDb.oldVersion) {
                case 0:
                    var keyValStore = upgradeDb.createObjectStore('keyval');
                    keyValStore.put('world', 'hello');
                case 1:
                    upgradeDb.createObjectStore('restaurant', { keyPath: 'id' });
            }
        });
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
}