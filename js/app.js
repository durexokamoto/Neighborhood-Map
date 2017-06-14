// These are the place listings that will be shown to the user.
var locations = [{
    title: 'Gen Korean BBQ House',
    foursquareID: '54bd90f5498e0b8a270a1466'
}, {
    title: 'Falafel’s Drive-In',
    foursquareID: '49ea79e5f964a5206d661fe3'
}, {
    title: 'A Slice of New York',
    foursquareID: '4d1ce25f09546dcbc76bd638'
}, {
    title: 'Smoking Pig BBQ',
    foursquareID: '4e4d753ac65be7ec3abbee91'
}, {
    title: 'Phở Kim Long',
    foursquareID: '4b187918f964a5202dd323e3'
}, {
    title: 'Philz Coffee',
    foursquareID: '4a55473ef964a520fcb31fe3'
}, {
    title: 'The Kickin’ Crab',
    foursquareID: '50d3a67be4b0d08462b63d96'
}, {
    title: 'Bill’s Café',
    foursquareID: '49e65838f964a5203b641fe3'
}, {
    title: 'ToBang',
    foursquareID: '4a9b3d51f964a520ce3420e3'
}, {
    title: 'SJ Omogari Korean Restaurant',
    foursquareID: '4a3bec21f964a520eaa01fe3'
}];

var map;
// Render the map with selected options on to the HTML div 'map-canvas'.
function initMap() {
    var mapOptions = {
        center: { lat: 37.378285, lng: -121.966043 },
        zoom: 11,
        mapTypeId: 'roadmap'
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}


var viewModel = function() {
    var self = this;
    // Create a new blank array for all the listing largeInfowindow.
    self.largeInfowindow = ko.observableArray([]);
    // Create a new blank array for all the places.
    self.places = ko.observableArray([]);
    // Declare model properties as observables.
    self.filter = ko.observable("");
    self.search = ko.observable("");
    // Render the map and declare it as an observable.

    // Retrieve JSON data from Foursquare and display selected data on markers.
    foursquareVenues(self.largeInfowindow, self.places, map);
    // Filter subset of location markers
    self.filteredVenues = ko.computed(function() {
        return ko.utils.arrayFilter(self.places(), function(venue) {
            if (venue.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
                if (venue.marker) {
                    venue.marker.setMap(map);
                }
            } else {
                if (venue.marker) {
                    venue.marker.setMap(null);
                }
            }
            return venue.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1;
        });
    }, self);
    // Click the marker will triger centerMarker() to center the marker and zoom it.
    self.clickHandler = function(data) {
        centerMarker(data, map, self.largeInfowindow);
        google.maps.event.trigger(data.marker, 'click');
    };
};


// Get JSON through Foursquare API.
// Use Foursquare ID to locate the venue which is wanted.
function foursquareVenues(largeInfowindow, places, map) {
    var config = {
        CLIENT_ID: 'XOYJG43FJ0D4IIOV10J5KHLPUASH2MWJ3RDETKVKV53ERSKU',
        CLIENT_SECRET: 'RB5ZU4TXG5OOFVH3UKFC3JLNM4GR51INJMEHZLPGU1VCKQQD'
    };
    var url = '';
    var info = [];
    // For each place in the place list request a JSON file.
    for (i = 0; i < locations.length; i++) {
        var location = locations[i];
        url = 'https://api.foursquare.com/v2/venues/' +
            location.foursquareID +
            '?client_id=' + config.CLIENT_ID +
            '&client_secret=' + config.CLIENT_SECRET +
            '&v=20181230' +
            '&m=foursquare';
        // A AJAX request to obtain data from Foursqaure, once fail the app will
        // pump up an alert.
        foursquareRequest(url);
    }

    function foursquareRequest(url) {
        $.ajax({
            url: url,
            dataType: "json",
            success: function(data) {
                var venue = data.response.venue;
                var rating = venue.rating ? venue.rating : 'No rating available';
                var url = venue.url ? venue.url : 'No link provided, please do not click!';
                info = {
                    title: venue.name,
                    rating: rating,
                    url: url,
                    lat: venue.location.lat,
                    lng: venue.location.lng,
                    address: venue.location.address +
                        "<br>" + venue.location.city + ", " +
                        venue.location.state + " " +
                        venue.location.postalCode
                };
                places.push(venue);
                // Send requested data to Markers maker.
                setMarkers(location, info, map, largeInfowindow, places);
            },
            error: function() {
                alert("Sorry. Can not get data from Foursquare!");
            }
        });
    }
}


// Cumstomize markers and show them.
function setMarkers(location, info, map, largeInfowindow, places) {
    var image = {
        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(20, 32),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 32)
    };
    // Shapes define the clickable region of the icon. The type defines an HTML
    // <area> element 'poly' which traces out a polygon as a series of X,Y points.
    // The final coordinate closes the poly by connecting to the first coordinate.
    var shape = {
        coords: [1, 1, 1, 20, 18, 20, 18, 1],
        type: 'poly'
    };
    // Convert lat and lng data to required format.
    var latlng = new google.maps.LatLng(info.lat, info.lng);
    // Send data to markers.
    var marker = new google.maps.Marker({
        icon: image,
        shape: shape,
        position: latlng,
        map: map,
        animation: google.maps.Animation.DROP,
        content: "<h4><mark><strong>" + info.title + "</strong></mark></h4>" +
            info.address + "<br>" +
            "<p style='color:red'>" + "Rating: " + info.rating + "/10</p>" +
            "<a href='" + info.url + "'>" + info.url + "</a>"
    });
    var infoWindow = new google.maps.InfoWindow({
        content: marker.content
    });
    // Dispay marker one by one.
    marker.infowindow = infoWindow;
    largeInfowindow.push(marker);
    places()[places().length - 1].marker = marker;
    google.maps.event.addListener(marker, 'click', function() {
        for (var i = largeInfowindow().length - 1; i >= 0; i--) {
            largeInfowindow()[i].infowindow.close();
        }
        infoWindow.open(map, marker);
    });
    google.maps.event.addListener(marker, 'click', function() {
        toggleBounce(marker);
    });
}

// To put the selected marker to the center of the map.
// and zoom in.
function centerMarker(data, map, markers) {
    // close the open infowindow
    for (i = 0; i < markers().length; i++) {
        markers()[i].infowindow.close();
    }
    map.setCenter(new google.maps.LatLng(data.location.lat, data.location.lng));
    map.setZoom(14);
    for (var i = 0; i < markers().length; i++) {
        if (data.name === markers()[i].content[0]) {
            google.maps.event.trigger(markers()[i], 'click');
        }
    }
}

// Marker animation.
function toggleBounce(marker) {
    marker.setAnimation(null);
    marker.setAnimation(google.maps.Animation.DROP);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 600);
}

// To handle the error case.
function mapError() {
    alert("Hey man. Map can not be loaded from Google.");
}

// Activate Knockout
ko.applyBindings(new viewModel());
