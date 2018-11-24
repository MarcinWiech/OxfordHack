const testUsers = [
  { id: '100451287653780', accessToken: 'EAAT1wPER77EBAOiquTpXYgj73kpVTZCZCAQBIyXKX3xS8nCcNDnCBRq0cp2U5EMRJIrx5jHiCWKhecBPHo3uJOWaMDMcp5YhhB8XPCP2alZCi5LMh6sKbLresWZC8Ioi9XSN0l0kjZBuNIWDs2pwZBNrzZBhFCzFUTIZBPLVt35rzzDFeMnEZAkoEZBIbQ8H8bZC8Q14iP1yfW9gHaEgRm0R0ZCX5BWjdE5PHx7z1JdN1ks1lmn2oAyQhT8w' },
  { id: '101050987592239', accessToken: 'EAAT1wPER77EBAAcs4BDfTJ7oWtqdHnKgqZBOT5BMz3gdIcxlPkydZCOK2gZBtapjHYFoonFjcf2IztNqxRWuS5ztsf52neFiZA1M8bltLUUWEcBBZBMAkE83pv8gmHA6VYZCAJScFbYJs2RZCCJe9Ea4wrxTHj2g0aUOgraSAsd5ltRMvPKuy4NsfObauTrNUmh0fDbFEsPIhUkSyw6sZAr4apHm7oNa5NpC1c5I818a9T7IMtrMpvBF' },
  { id: '101706357526010', accessToken: 'EAAT1wPER77EBAAq2ASH1XLNOz16NugUzSSLqXAyyP525uDP835d8V85jlZCTm5ZADonaYaz2JoWvgr4V8dhw84EjQI2AjtNjrq6u8s2hipUanMGVGxuHR2PSZAXXTZAkv7GH1t5gPAmXh4WFnwibaeXktb4jiOAwEV5hoSMXC0LAyuG7AMzMreWlCudW1OUEWORjp9ECxEVSZASODIBG1pNAZCNXAhLgZB3n2c7kSRJUZBKmcCZBoeSJ4' },
  { id: '112653289758396', accessToken: 'EAAT1wPER77EBANsZAsWPyrM9vEz5g7wKDBx6Fkz9P9IuTwd1U0mCNDBrCiUZAZBNx60OHnocPmemDgstAkxkmKFioMZBpSy4QkzQV9d9uuENIztwPZCUzbnxTPfZByo3MxpaZAuQUHuZARGt05LXWvBgyZAvUGTXmC3MBEyvwKsTlR4A04i90H8ir5W1OMjs5jGORKfKFAYnDnlMH9NxvZAR2qCylvqymM4ZBpBY2cIrFo6fon3ZAGukg3wo'},
  { id: '100384240993555', accessToken: 'EAAT1wPER77EBAGpYKklqnzguzfg7YuCYSioQxIGm4nEI0BZB5rZBHSZBTapQoIoZAZCZCZBzh48VroMjgr7j8hmO5VasFQZAIcStgMj4dH1IS2MASMjote4uffFKg5L9kPGzsFHGPUsvPl85vGywlJmeTXAIH09wkKEqYyaQj43hIAYZCtSfx82We0uzYciRbDePTlZCqKOTyfEX5Cc2XvFM3BEJMhiocKrjHlM47HamtPZC16qD5bwf7Ek' }
]

class Database {

  constructor() {
    this.users = []

    for (let user of testUsers) this.users.push(user)
    console.log(this.users)
  }

  add(user) {
    for (let { id } of testUsers) {
      if (id == user.id) return
    }
    this.users.push(user)
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