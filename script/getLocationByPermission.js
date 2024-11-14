
function getUserManuallyPosition(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getcoordinates,showerror);
    }
    else{
        alert("Geolocation not Working");
    }
}

function getcoordinates(position){
var locationInput_Field = $("#pac-input");

    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    var getUser_Location = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&key=AIzaSyA6FFVGq29kQZws-OzhuCYwcSdirU3tjWI"

    $.get(getUser_Location,function(params){
        console.log(params);
        locationInput_Field.val(params.results[0].address_components[4].long_name + ", " + params.results[0].address_components[6].long_name);
        window.localStorage.setItem("UserLocation",locationInput_Field.val());
    })
}

function showerror(error){
    if(error.code = 0){
        alert("UNKNOW ERROR");;
    }
    else if(error.code = 1){
        alert("PERMISSION DENIED");
    }
    else if(error.code = 2){
        alert("POSITION UNAVAILABEL");
    }
    else if(error.code = 3){
        alert("SERVICE TIMEOUT");
    }
}



var main_Location = window.localStorage.getItem("UserLocation");

window.onload = () =>{
    var subLocationBox = $("#pac-input");
    subLocationBox.val(main_Location);
}

