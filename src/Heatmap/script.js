  // map center
  var myLatlng = new google.maps.LatLng(51.77, -1.24);
  // map options,
  var myOptions = {
    zoom: 4,
    center: myLatlng
  };
  // standard map
  map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
  // heatmap layer
  heatmap = new HeatmapOverlay(map, 
    {
      // radius should be small ONLY if scaleRadius is true (or small radius is intended)
      "radius": 0.5,
      "maxOpacity": 1, 
      // scales the radius based on map zoom
      "scaleRadius": true, 
      // if set to false the heatmap uses the global maximum for colorization
      // if activated: uses the data maximum within the current map boundaries 
      //   (there will always be a red spot with useLocalExtremas true)
      "useLocalExtrema": true,
      // which field name in your data represents the latitude - default "lat"
      latField: 'lat',
      // which field name in your data represents the longitude - default "lng"
      lngField: 'lng',
      // which field name in your data represents the data value - default "value"
      valueField: 'count'
    }
  );

  function setData(testData){
      return (heatmap.setData(testData));
    }

    // module.exports = { setData: setData }
