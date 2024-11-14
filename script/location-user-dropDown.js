  function initialize() {
    var address = (document.getElementById('pac-input'));
    var autocomplete = new google.maps.places.Autocomplete(address);
    autocomplete.setTypes(['geocode']);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

    var address = '';
    if (place.address_components){
        address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        var a = place.geometry.location.lat();
        var b = place.geometry.location.lng();
        console.log(a);
        console.log(b);
    });
}

google.maps.event.addDomListener(window, 'load', initialize);

