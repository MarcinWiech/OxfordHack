
var testData = {
    max: 1000,
    data: []
  };


$.ajax({
    type: 'GET',
    url: 'http://localhost:3000/api/posts',
    success: msg => msg.forEach(obj => (getLatLong(obj))),
    error: err => alert(JSON.stringify(err))
});


//make testData dependant on the posts {lat: 51.77, lng: -1.24, count: 1}, {lat: 52.77, lng: -1.8, count: 1},{lat: 53.77, lng: -1.6, count: 1}




function getLatLong(response) {
    const {place, danger} = response;



    if(place  === undefined){
        return {}
    }
    else if(place.location  === undefined && danger){
        return {}
    }
    else{
        testData.data.push({lat: place.location.latitude, lng: place.location.longitude, count: 100});
        return {lat: place.location.latitude, lng: place.location.longitude, count: 100}
    }

}


setTimeout(function(){setData(testData)}, 5000);



