const rp = require('request-promise')
const categories = new Set(['fuel', 'shelter', 'information', 'volunteer work', 'transport', 'clothing', 'water', 'food', 'toiletries', 'equipment'])

function isCategory(word) {
  return categories.has(word)
}

// Returns a list of relevant categories.
async function categoriseMessage(message) {

  // const cats = []
  // const words = message.split(' ')
  // for (let word of words) {
  //   if (isCategory(word)) cats.push(word)
  // }

  const cats = await rp({
    method: 'POST',
    uri: 'http://localhost:5000/categorise',
    body: {
      text: message
    },
    json: true
  })

  return cats
}

module.exports = {
  categoriseMessage: categoriseMessage
}