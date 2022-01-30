const sleep = require('system-sleep')
const database = require('./database');
const discord = require('discord.js')

const client = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"] });

let dataLoaded = false
let serverId = 881086913925251100
let owner = 702872499402178601
let ranks = {
    1: ['member', '881087229982806016'],
    2: ['moderator', '881087417300439040'],
    3: ['admin', '881087452863942656'],
    4: ['headadmin', '881087515581354004'],
    5: ['ruxyolo', '881087260940959765']
}

let data = {}
async function main() {
    await database.get('serverId').then((d) => {
        serverId = d
    })
    await database.get('ownerId').then((d) => {
        owner = d
    })
    console.log('Result: ' + serverId)
}

async function start() {
    await main()
    console.log('done')

    def = {
        'owner': owner,
        'serverId': serverId,
        'getRank': getRank,
        'getClientUser': getClientUser,
        'log': sendLog

    }
    dataLoaded = true
}
start()

function getRank(user) {
    let rank = 0

    for (i in ranks) {
        let rankId = ranks[i][1]
        if (user.roles.cache.find(role => role.id === rankId)) {
            rank = i
        }
    }
    return rank
}

function getClientUser() {
    return client.user
}

function sendLog(guild, msg) {
    let channel = guild.channels.cache.find(channel => channel.id === '935619297689088030')
    channel.send(msg)
}

while (dataLoaded == false) {
    sleep(1000)
}
console.log('Loading complete')
module.exports = def