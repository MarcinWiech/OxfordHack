const request = require('request');
const uuidv4 = require('uuid/v4');
const subscriptionKey = "720a6bbe3e914dc4a465dca0bd5f0e3e"

function generateRequestOptions(message) {
    return {
        method: 'POST',
        baseUrl: 'https://api.cognitive.microsofttranslator.com/',
        url: 'translate',
        qs: {
          'api-version': '3.0',
          'to': 'it',
          'to': 'en'
        },
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-type': 'application/json',
          'X-ClientTraceId': uuidv4().toString()
        },
        body: [{
              'text': message
        }],
        json: true,
    };
}



request(generateRequestOptions("Buenos dias mi amigo, que pasa?"), function(err, res, body){
    console.log(JSON.stringify(body, null, 4));
});
