let restaurants,
    neighborhoods,
    cuisines;
var newMap;
var markers = [];

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js').then(result => {
        console.log('Registered Service Worker');
    }).catch(err => {
        console.log('Error, unable to register Service Worker');
    });
} else {
    console.log('Service workers are not supported.');
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    IDBHelper.initIdb();
    initMap(); // added 
    fetchNeighborhoods();
    fetchCuisines();
    fetchReviews();
});

// Fetch all reviews
fetchReviews = () => {
    IDBHelper.fetchReviews((error, reviews) => {
        if (error) {
            callback(error, null);
        }
    });
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    IDBHelper.getNeighborhood((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });

    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
    IDBHelper.getCuisine((error, cuisines) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });

    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
    self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiY2FjZXYiLCJhIjoiY2ppYzlvY290MDFjcDNyanJocnVsbGVwcCJ9.0bfvulUSV0kSI06s8_lDTg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a tabindex="-1" href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a tabindex="-1" href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a tabindex="-1" href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(newMap);

    updateRestaurants();
};
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    IDBHelper.getRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    });
    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.alt = 'Image of the restaurant: ' + restaurant.name;
    image.src = (DBHelper.imageUrlForRestaurant(restaurant)) ? DBHelper.imageUrlForRestaurant(restaurant) : IDBHelper.getImageUrlForRestaurant(restaurant);
    li.append(image);

    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.setAttribute('role', 'button');
    more.setAttribute('aria-label', 'View details for the restaurant ' + restaurant.name);
    more.href = (DBHelper.urlForRestaurant(restaurant)) ? DBHelper.urlForRestaurant(restaurant) : IDBHelper.getUrlForRestaurant(restaurant);
    li.append(more);

    const favoriteIcon = document.createElement('i');
    favoriteIcon.setAttribute('class', 'far fa-heart');
    favoriteIcon.id = 'favoriteRestaurant' + restaurant.id;
    favoriteIcon.dataset.favorite = restaurant.is_favorite;
    if (restaurant.is_favorite == "true" || restaurant.is_favorite == true) {
        favoriteIcon.style.color = 'pink';
    }
    favoriteIcon.onclick = function(event) {
        var isFavorite = (event.currentTarget.dataset.favorite == "true" || event.currentTarget.dataset.favorite == true) ? true : false;
        var restaurantId;
        if (isFavorite) {
            favoriteIcon.dataset.favorite = false;
            event.currentTarget.style.color = 'black';
            restaurantId = parseInt(event.currentTarget.id.slice(18, event.currentTarget.id.length));
            IDBHelper.favoriteRestaurant(restaurantId, false);
        } else {
            favoriteIcon.dataset.favorite = true;
            event.currentTarget.style.color = 'pink';
            restaurantId = parseInt(event.currentTarget.id.slice(18, event.currentTarget.id.length));
            IDBHelper.favoriteRestaurant(restaurantId, true);
        }
    };
    li.append(favoriteIcon);

    return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    self.newMap.invalidateSize();
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = (DBHelper.mapMarkerForRestaurant(restaurant, self.newMap)) ? DBHelper.mapMarkerForRestaurant(restaurant, self.newMap) : IDBHelper.getMapMarkerForRestaurant(restaurant, self.newMap);
        marker.on("click", onClick);

        function onClick() {
            window.location.href = marker.options.url;
        }
    });
};

/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */