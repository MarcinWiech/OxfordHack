const azure = require('azure-storage')

const ENDPOINT = 'https://oxfordhack.queue.core.windows.net/oxfordhack/messages'
const API_KEY = 'm02JhfarBd1DJ924xlDP6uOW18h7isXQ+359ehPJ8yTdBqNoJ//TFfUsseVtN+A9DJAC2NiXfzhUEbhBBVmVBQ=='

const queue = azure.createQueueService('oxfordhack', API_KEY) 


async function getTweet() {
  const promise = new Promise((resolve, reject) => {
    queue.getMessages('oxfordhack', (error, results, response) => {
      if (error) {
        console.error(error)
        return reject(error)
      }
      const message = results[0]

      // TODO delete message

      resolve(message)
    })
  })

  return await promise
}

module.exports = {
  getTweet: getTweet
}