const categories = new Set(['fuel', 'shelter', 'information', 'volunteer work', 'transport', 'clothing', 'water', 'food', 'toiletries', 'equipment'])

function isCategory(word) {
  return categories.has(word)
}

// Returns a list of relevant categories.
function categoriseMessage(message) {

  const cats = []
  const words = message.split(' ')
  for (let word of words) {
    if (isCategory(word)) cats.push(word)
  }

  return cats
}

module.exports = {
  categoriseMessage: categoriseMessage
}