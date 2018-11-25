const azure = require('azure-storage')

const ENDPOINT = 'https://oxfordhack.queue.core.windows.net/oxfordhack/messages'
const API_KEY = 'm02JhfarBd1DJ924xlDP6uOW18h7isXQ+359ehPJ8yTdBqNoJ//TFfUsseVtN+A9DJAC2NiXfzhUEbhBBVmVBQ=='

const encoder = new azure.QueueMessageEncoder.TextBase64QueueMessageEncoder()
const queue = azure.createQueueService('oxfordhack', API_KEY) 


async function getTweets() {
  const promise = new Promise((resolve, reject) => {
    queue.getMessages('oxfordhack', (error, results, response) => {
      if (error) {
        console.error(error)
        return reject(error)
      }

      results.forEach(message => {
        message.message = encoder.decode(message.messageText)
        console.log(message.message)
        //2018-11-25T09:00:45

        const words = message.message.split(' ')
        message.created_time = words[0]

        message.message = words.slice(1).join(' ')

        message.postID = message.messageId
        queue.deleteMessage('oxfordhack', message.message, message.popReceipt, (err) => {
          if (!error) console.log(`${message.messageId} deleted.`)
        })
      })
      
      resolve(results)
    })
  })

  const res = await promise
  return res
}

module.exports = {
  getTweets: getTweets
}