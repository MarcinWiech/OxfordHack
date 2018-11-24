const API_KEY = "5vJtJlgNrbD45VZacenkxkbuNVl8E0bQb4cCm/Bq/wwUtpV6juoJk2XnOKRj9LbzCqe1wglnugUK0iRf6TGt7A=="
const ENDPOINT = "https://ussouthcentral.services.azureml.net/workspaces/ab4401d780c94bc09d98c1bedce5b385/services/ae4f7958523e4cf7ad3b2894a2817ea7/execute?api-version=2.0&details=true"
const rp = require('request-promise')

/**
 * Takes in a list of messages (of type string), returns a Promise that resolves to a list of scores (of type int).
 */
async function getPrediction(messages) {
  messages = messages.map(entry => [entry])
  const body = {
    'Inputs': {
      'input1': {
        'ColumnNames': ['Text'],
        'Values': messages
      }
    }
  }

  const response = await rp({
    method: 'POST',
    uri: ENDPOINT,
    body: body,
    json: true,
    headers: {
      'authorization': `Bearer ${API_KEY}`,
      'content-type': 'application/json'
    }
  })

  let values = response.Results.output1.value.Values
  values = values.reduce((prev, curr) => prev.concat(curr), [])
  values = values.map(Number)

  const zipped = []
  for (let i = 0; i < messages.length; ++i) {
    zipped.push({ 'message': messages[i], 'danger': values[i] == 1 })
  }
  
  return zipped
}

module.exports = {
  getPrediction: getPrediction
}