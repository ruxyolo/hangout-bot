const sleep = require('system-sleep');
const database = require('./database');
const discord = require('discord.js');
const axios = require('axios')

const client = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILD_VOICE_STATES", "GUILD_MESSAGE_REACTIONS", "GUILD_INVITES"] });

let dataLoaded = false
let maintemenceMode = false
let serverId = 881086913925251100
let owner = 702872499402178601
let eventChannels = []
let talkRoleId = '881155355533525002'
let disabledRoles = ['881087260940959765', '881088147130294282']
let unkickables = ['702872499402178601']

let ranks = {
    1: ['member', '881087229982806016'],
    2: ['moderator', '881087417300439040'],
    3: ['admin', '881087452863942656'],
    4: ['headadmin', '881087515581354004'],
    5: ['ruxyolo', '881087260940959765']
}

async function load() {
    await database.get('serverId').then((d) => {
        serverId = d
    })
    await database.get('ownerId').then((d) => {
        owner = d
    })
    await database.get('eventChannels').then((d) => {
        d.forEach(channel => {
            eventChannels.push(channel)
        });
    })

    def = {
        //vars
        owner,
        serverId,
        eventChannels,
        disabledRoles,
        talkRoleId,
        unkickables,
        client,
        //functions
        'getRank': getRank,
        'getClientUser': getClientUser,
        'log': sendLog,
        'randomize': randomize,
        'sendEmbed': sendEmbed,
        'get': getReq,

    }
    dataLoaded = true
}

load()

async function getReq(path) {
    console.log('Recived request')
    return new Promise((resolve, reject) => {
        axios.get(path).then(res => {
                data = res.data
                resolve(data)
            })
            .catch((e) => {
                console.log(e)
                reject(e)
            })
    })
}

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
    if (maintemenceMode == false) {
        let channel = guild.channels.cache.find(channel => channel.id === '935619297689088030')
        channel.send(msg)
    }
}


function randomize(words) {
    let message = ''
    for (let i = 0; i < 10; i++) {
        if (i == 9) {
            message = message + words[Math.floor(Math.random() * words.length)];
            break
        }
        message = message + words[Math.floor(Math.random() * words.length)] + ' ';
    }
    return message
}

function sendEmbed(channel, title, desc, col, thumb, fields, footerD, timestamp) {
    if (!col) {
        col = 'WHITE'
    }
    const embed = new discord.MessageEmbed()

    if (typeof(title) == 'string') {
        embed.setTitle(title)
        embed.setColor(col)
        if (typeof(desc) == 'string') {
            embed.setDescription(desc)
        }
        if (typeof(thumb) == 'string') {
            embed.setThumbnail(thumb)
        }

        if (typeof(fields) == 'object' && fields[0]) {
            embed.setFields(fields)
        }
        if (typeof(footerD) == 'object') {
            let valid = false
            let footerT = ''
            let footerIcon = ''
            if (footerD['text']) {
                valid = true
                footerT = footerD['text']
                if (footerD['icon_url']) {
                    if (footerD['icon_url'].substring(0, 8) == 'https://') {
                        valid = true
                        footerIcon = footerD['icon_url']
                    } else {
                        valid = false
                    }
                }
            }
            if (valid == true) {
                embed.setFooter(footerT, footerIcon)
            }
        }
        if (timestamp) {
            if (timestamp == true) {
                let now = Date.UTC(Date.now())
                embed.setTimestamp(now)
            } else {
                embed.setTimestamp(timestamp)
            }
        }

        channel.send({ embeds: [embed] })
    }
}

while (dataLoaded == false) {
    sleep(100)
}
console.log('Loading complete')
module.exports = def