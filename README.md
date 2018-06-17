# Mobile Web Specialist Course Project
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project: Stage 1

Turn the website **Restaurant Reviews** to a responsive design. Cannot use bootstrap or any other framework for this project. After this create a Service Worker that will worker with cached data in order for the website to work as an offline first application.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

### How to start the project

1. To start the project locally I use python. Please follow the instructions below in order to start the server locally with python 2.x or above.

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.

## Leaflet.js and Mapbox:

This project uses [leafletjs](https://leafletjs.com/) with [Mapbox](https://www.mapbox.com/). The combination fo the 2 APIs help display the restaurant's information on the map shown. In order to use them correctly, you need to replace `<your MAPBOX API KEY HERE>` with a token from [Mapbox](https://www.mapbox.com/). Mapbox is free to use, and does not require any payment information. 

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write. 



