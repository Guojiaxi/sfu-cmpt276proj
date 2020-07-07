
window.onload = function() {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCHOG78YkbxyjS10mfcWE0ivR_QIOjuIcw&callback=initMap';
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);
};

window.initMap = function() {

    var mapOptions = {
        zoom: 20,
        minZoom: 15,
        maxZoom: 20,
        center: {lat: 49.277717, lng: -122.917871},
        mapTypeControlOptions: { mapTypeIds: [] },
        mapTypeId: 'roadmap',
        streetViewControl: false
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
};