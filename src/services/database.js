const { Connection, Request } = require('tedious')
const tp = require('tedious-promises')

const testUsers = [
  // { id: '100451287653780', accessToken: 'EAAT1wPER77EBACmZACTyM770wrtZBcwhOXBLp6r4Y2QPk3SGyuDvpmlZB58RKoBz206vxZBYw7iGyw3n75gaZC9AWKAcrd3foc3tdTWRSm5QEQLGsZCWwmVLOJI0OxYu6y95kxgBP7wNYNRR6FccbzwW6ZAmJoDuIrjQhocLM7C7vjI7Vr8ZB9OZBlHo87MJFlZBZBqmQCvZAVqrCZCZCzY1D3BJFUIRc1ZB9IGYk4pvpvf9RxUX0ZADEmAAZC6AR' },
  // { id: '101050987592239', accessToken: 'EAAT1wPER77EBAJwgpewVNgHmcwQCW7BiyFiXM5UVFEnePHwkx7WsYvPldb0SGsH6QMJvmulXu9Rote61r84ZBRxTHY7m09dcVGZBvXPCBOcHKhy8dUAsPduA1BXsfzayvQNHaLZBDr3hHuZCbcocejw0SH7LWzgZAurtZAtRKCjd5YHY8R0NVLjdkezIIZAUW06UW0ZAP7p1IBru8U9zclErCN31R4zcVHDVgoZCDg9LkVq4HfDrYptec' },
  // { id: '101706357526010', accessToken: 'EAAT1wPER77EBAAq2ASH1XLNOz16NugUzSSLqXAyyP525uDP835d8V85jlZCTm5ZADonaYaz2JoWvgr4V8dhw84EjQI2AjtNjrq6u8s2hipUanMGVGxuHR2PSZAXXTZAkv7GH1t5gPAmXh4WFnwibaeXktb4jiOAwEV5hoSMXC0LAyuG7AMzMreWlCudW1OUEWORjp9ECxEVSZASODIBG1pNAZCNXAhLgZB3n2c7kSRJUZBKmcCZBoeSJ4' },
  // { id: '112653289758396', accessToken: 'EAAT1wPER77EBANsZAsWPyrM9vEz5g7wKDBx6Fkz9P9IuTwd1U0mCNDBrCiUZAZBNx60OHnocPmemDgstAkxkmKFioMZBpSy4QkzQV9d9uuENIztwPZCUzbnxTPfZByo3MxpaZAuQUHuZARGt05LXWvBgyZAvUGTXmC3MBEyvwKsTlR4A04i90H8ir5W1OMjs5jGORKfKFAYnDnlMH9NxvZAR2qCylvqymM4ZBpBY2cIrFo6fon3ZAGukg3wo'},
  // { id: '100384240993555', accessToken: 'EAAT1wPER77EBAGpYKklqnzguzfg7YuCYSioQxIGm4nEI0BZB5rZBHSZBTapQoIoZAZCZCZBzh48VroMjgr7j8hmO5VasFQZAIcStgMj4dH1IS2MASMjote4uffFKg5L9kPGzsFHGPUsvPl85vGywlJmeTXAIH09wkKEqYyaQj43hIAYZCtSfx82We0uzYciRbDePTlZCqKOTyfEX5Cc2XvFM3BEJMhiocKrjHlM47HamtPZC16qD5bwf7Ek' }
]

// Database setup
const config = {
  userName: 'oh2018',
  password: 'OxfordHack@2018',
  server: 'oh2018-disaster.database.windows.net',
  options: {
    database: 'users',
    encrypt: true
  }
}

class Database {

  constructor() {
    tp.setConnectionConfig(config)
    // this.conn = new Connection(config)
    this.users = []

    for (let user of testUsers) this.users.push(user)
    console.log(this.users)
  }

  async add(user) {
    // for (let { id } of testUsers) {
    //   if (id == user.id) return
    // }
    // this.users.push(user)

    const { id, accessToken } = user
    const res = await tp.sql(`SELECT * FROM FacebookUser WHERE id = ${id}`).execute()

    if (!res.length) return await tp.sql(`INSERT INTO FacebookUser (id, accessToken) VALUES (${id}, '${accessToken}')`).execute()
    return await tp.sql(`UPDATE FacebookUser SET accessToken = '${accessToken}' WHERE id = ${id}`)
  }

  async getUsers() {
    return await tp.sql('SELECT * FROM FacebookUser').execute()
  }

  async delete(id) {
    if (id == null) return await tp.sql('DELETE FROM FacebookUser WHERE 1 = 1').execute()
    return await tp.sql(`DELETE FROM FacebookUser WHERE id = ${id}`).execute()
  }

}

var instance = null
function getInstance() {
  if (instance == null) instance = new Database()
  return instance
}

module.exports = {
  getInstance: getInstance
}