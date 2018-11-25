const rp = require('request-promise')
const uuidv4 = require('uuid/v4')

const BASE_URL = 'https://api.cognitive.microsofttranslator.com/'
const SUBSCRIPTION_KEY = '720a6bbe3e914dc4a465dca0bd5f0e3e'

async function getTranslations(messages) {
  const option = optionBuilder(messages)

  const results = await rp(option)

  return results.map(result => {
    const { detectedLanguage, translations } = result
    const { language } = detectedLanguage
    return {
      language: language,
      text: translations[0].text
    }
  })  
}

function optionBuilder(messages) {
  return {
    method: 'POST',
    baseUrl: BASE_URL,
    url: 'translate',
    qs: {
      'api-version': '3.0',
      'to': 'en'
    },
    headers: {
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString()
    },
    body: messages.map(msg => { 
      return { 'text': msg }
    }),
    json: true
  }
}

module.exports = {
  getTranslations: getTranslations
}