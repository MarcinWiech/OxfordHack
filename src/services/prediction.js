const API_KEY = "5vJtJlgNrbD45VZacenkxkbuNVl8E0bQb4cCm/Bq/wwUtpV6juoJk2XnOKRj9LbzCqe1wglnugUK0iRf6TGt7A=="
const ENDPOINT = "https://ussouthcentral.services.azureml.net/workspaces/ab4401d780c94bc09d98c1bedce5b385/services/ae4f7958523e4cf7ad3b2894a2817ea7/execute?api-version=2.0&details=true"
const rp = require('request-promise')
const extract = require('extract-string')

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

  const { output1, output2 } = response.Results

  let scores = output1.value.Values // array of scores, 0s and 1s
  scores = scores.reduce((prev, curr) => prev.concat(curr), []) // concatenated
  scores = scores.map(Number) // type casting
  console.log(scores)

  const srcVocab = output2.value.ColumnNames // array of ['Preprocessed Text.[hurricane]']
  const vocab = []
  srcVocab.forEach(input => {
    const [{ word }] = extract(input).pattern('Preprocessed Text.[{word}]')
    vocab.push(word)
  })
  

  let allFrequencies = output2.value.Values  //
  console.log(JSON.stringify(response.Results))

  

  const zipped = []
  for (let i = 0; i < messages.length; ++i) {
    const frequencies = allFrequencies[i].map(Number)
    let wordToScore = zip(vocab, frequencies, 'word', 'score')

    // Ignore scores that are absolutely zero
    wordToScore = wordToScore.filter(({ _, score }) => score != 0)
    console.log(wordToScore)

    zipped.push({ 'message': messages[i], 'danger': scores[i] == 1, 'tags': wordToScore })
  }
  
  return zipped
}

function zip(a, b, leftName, rightName) {
  const res = []
  for (let i = 0; i < a.length; ++i) {
    const obj = {}
    obj[leftName] = a[i]
    obj[rightName] = b[i]
    res.push(obj)
  }
  return res
}

module.exports = {
  getPrediction: getPrediction
}