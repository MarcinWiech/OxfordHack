
var testData = {
    max: 1000,
    data: [{lat: 51.77, lng: -1.24, count: 10}, {lat: 52.77, lng: -1.8, count: 2},{lat: 53.77, lng: -1.6, count: 10},]
  }

//make testData dependant on the posts


$.ajax({
    type: 'GET',
    url: 'http://localhost:3000/api/posts',
    success: msg => msg.forEach(obj => buildCard(obj)),
    error: err => alert(JSON.stringify(err))
});

function buildCard(response) {
    const {latitude, longitude} = response;

    if(latitude === undefined || longitude === undefined){
        return null;
    }
    else{
        testData.data.push({lat: latitude, lng: longitude, count: 5})
    }

}


