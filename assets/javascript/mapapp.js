var muniSearch = [];
var returnMuni = [];
var muniBounds;

/*Colors*/
var muniOutlineColor = "#1E8BC3"; //blue
var findMeOutline = "#36D7B7"; //turquoise
var findMeFill = "#7fe6d1"; //turquoise with 30% fill

/*Adjust elements based on device*/
if (document.body.clientWidth > 768) {
  var isCollapsed = false;
  var openZoom = 11;
} else {
  isCollapsed = true;
  openZoom = 12;
}

/*
Basemaps
Sources: https://leaflet-extras.github.io/leaflet-providers/preview/
        https://www.mapbox.com/developers/api/maps/#mapids
*/
var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}),
  MapBox = L.tileLayer('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://mapbox.com/about/maps/">MapBox</a>',
	subdomains: 'abcd',
	id: 'mapbox.streets',
	accessToken: 'pk.eyJ1IjoiYnJ5YW5ncmlsbCIsImEiOiJjaWg4MmR5NmcwcmtvdWtrdDVoc3Q3eDU4In0.XyMf6SNqJ5uy65DjhW4R6A'
}),
  MapBox_Aerial = L.tileLayer('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://mapbox.com/about/maps/">MapBox</a>',
	subdomains: 'abcd',
	id: 'mapbox.streets-satellite',
	accessToken: 'pk.eyJ1IjoiYnJ5YW5ncmlsbCIsImEiOiJjaWg4MmR5NmcwcmtvdWtrdDVoc3Q3eDU4In0.XyMf6SNqJ5uy65DjhW4R6A'
});

/*Overlay Data
  Set up muni layer*/
var muniWarranteeLayer = L.geoJson(null, {
  style: function (feature) {
    return {
      color: muniOutlineColor,
      weight: 1,
      opacity: 1,
      fillOpacity: 0
    };
  },
  onEachFeature: function (feature, layer) {
    muniSearch.push({
      name: layer.feature.properties.MUNI,
      bounds: layer.getBounds()
    });
    if (feature.properties.WARRANTEE) {
      var waranteeContent = '<img class="img-responsive img-thumbnail img-in-modal" alt="Warantee Map" src="' + feature.properties.WARRANTEE + '"/>';
      var waranteeImage = '<button type="button" class="btn btn-img center-block" id="feature-image"><a target="_blank" href="' + feature.properties.WARRANTEE + '">View Full Size Image</a></button>';
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.MUNI);
          $("#feature-info").html(waranteeContent);
          $("#full-img-btn").html(waranteeImage);
          $("#muniModal").modal("show");
        }
      });
    }else {
      layer.on({
        click: function (e) {
          $("#feature-title-noimg").html(feature.properties.MUNI);
          $("#feature-info-noimg").html("No Image!").addClass("text-center");
          $("#muniNoImgModal").modal("show");
        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: muniOutlineColor,
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        muniWarranteeLayer.resetStyle(e.target);
      }
    });
  }   
});

//Call and turn on muni layer
$.getJSON("assets/data/muniUrl.geojson", function (data) {
  muniWarranteeLayer.addData(data);
  map.addLayer(muniWarranteeLayer);
});
//call warrantee maps
var warrantMaps = L.esri.dynamicMapLayer('http://gisapp2:6080/arcgis/rest/services/WarranteeMap/MapServer', {
	opacity: 1
});
// force the warrant map tiles behind overlays once it loads
warrantMaps.once("load", function(){
  warrantMaps.bringToBack();
});

//set map boundaries
var southWest = L.latLng(39.734, -76.670),
    northEast = L.latLng(40.332, -75.870),
    bounds = L.latLngBounds(southWest, northEast);

// Initilize Map
var map = L.map("map", {
  zoom: openZoom,
  center: [40.03788, -76.30569],
  maxBounds: bounds,
  maxZoom: 19,
  minZoom: 10,
  layers: [MapBox],
  zoomControl: false,
  attributionControl: false
});

/*Set baselayer and overaly object for toggling*/
var baseMaps = {
    "Streets": MapBox,
    "Aerial": MapBox_Aerial
};
var overlays = {
    "Municipal Boundaries": muniWarranteeLayer,
    "Warrant Maps": warrantMaps
};

/*Layer Control for Toggling*/
L.control.layers(baseMaps, overlays, {
    collapsed: isCollapsed
}).addTo(map);

//Zoom control for zoom in/out
L.control.zoom({
  position: "topleft"
}).addTo(map);

//Full extent
$("#home, .navbar-brand").click(function() {
    map.fitBounds(muniWarranteeLayer.getBounds());
});

//find and zoom to user
function delLayer(e){
  map.removeLayer(e);
}

$("#find-me").click(function(){
  navigator.geolocation.getCurrentPosition(function(position) {
    var latlng = L.latLng(position.coords.latitude, position.coords.longitude);
    var locMarker = L.circle(latlng, 50, {
      color: findMeOutline,
      fillColor: findMeFill,
      fillOpacity: 0.3
    });
    map.panTo(latlng).setZoom(18);
    map.addLayer(locMarker);
    setTimeout(function() {
      delLayer(locMarker);
    }, 2500);
  });
});

//bottom controls
$(document).ready(function(){
    $(".custom-attribute, #mousemove").hide();
    
    $("#toggle-attrb").click(function(){
        
        if ($(window).width() < 768) {
          $("#attrb-col").removeClass("col-xs-9").addClass("col-xs-12");
        }
        $(".custom-attribute").fadeToggle("slow");
    });
    $("#toggle-latlng").click(function(){
        $("#mousemove").fadeToggle("slow");
    });
});

//attribution
var customAttribute = 'Built with <a target="blank" href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> by <a target="blank" href="http://co.lancaster.pa.us/143/GIS-Division" title="Lancaster County GIS">Lancaster Co GIS</a> | ';
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $(".custom-attribute").html((customAttribute + layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

//latlng mouse cursor
var mousemove = document.getElementById('mousemove');
map.on('mousemove', function(e) {
    window[e.type].innerHTML = e.latlng.toString();
});

/*
printing:
https://github.com/mapbox/leaflet-image
https://parall.ax/products/jspdf
*/

/*Search and Zoom to Muni*/
//wait for json to load then push muni names into array for autocomplete to search
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function(){
    for (var i=0; i < muniSearch.length ; i++){
      returnMuni.push(muniSearch[i]["name"]);
    }
    return returnMuni;
  }, 2000);
}, false);

//simple typeahead search
// constructs the suggestion engine
/*
var muniBH = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  local: returnMuni
});

$('#muni-search .typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
},
{
  name: 'muni',
  source: muniBH
});
*/


//autocomplete search

$( "#muni-search" ).autocomplete({
  autoFocus:true,
  minLength:2,   
  delay:500,   
  source: returnMuni,
  select: function(event, ui){
    //get the entered text and pass it to to corresponding bounds
    new function(){
      for (var i=0; i < muniSearch.length; i++){
        if (ui.item.value === muniSearch[i]["name"]){
          muniBounds = muniSearch[i]["bounds"];
        }
      }
      map.fitBounds(muniBounds);
    };
  }
});
