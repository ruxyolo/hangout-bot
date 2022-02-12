const noblox = require('noblox')
const modules = require('../modules')
const database = require('../database');

let words = ['blue', 'red', 'yellow', 'green', 'purple', 'pink', 'white'];

async function setRobloxData(msg, id, dmC) {
    let message = modules.randomize(words)
    const filter = collector => collector.author.id === msg.author.id
    await msg.author.send(`Please set your roblox user description to "${message}", then type "done". You can type "update" to remake the description in case that roblox filters it.`)
    dmC.awaitMessages({ filter, max: 1, time: 1200000, errors: ['time'] }).then(async collector => {
        if (collector.first().content.toLowerCase() == 'done') {
            noblox.getPlayerInfo(id).then(async info => {
                if (info.blurb == message && info.isBanned == false) {
                    const thumbnail = await noblox.getPlayerThumbnail(id, "48x48", "png", true, "headshot")
                    msg.author.send('User was found. You may now change back your description.')
                    modules.sendEmbed(msg.author, info.username, `**Description:** ${info.blurb}, **Joined:** ${info.joinDate}, **Friends:** ${info.friendCount}, **Old names:** ${info.oldNames}.`, 'GREEN', thumbnail[0]['imageUrl'])
                    await msg.author.send('Is this your account? (Type yes or no)')
                    dmC.awaitMessages({ filter, max: 1, time: 1200000, errors: ['time'] }).then(async collector => {
                        if (collector.first().content.toLowerCase() == 'yes') {
                            database.set(`/users/${msg.author.id}/roblox`, { username: info.username, id: id })
                            msg.author.send('Roblox account was successfully conected!')
                        } else if (collector.first().content.toLowerCase() == 'no') {
                            msg.author.send('Operation successfully aborted!')
                        }
                    }).catch((e) => msg.author.send('Timeouted, please redo the verify command in the server.'))
                } else {
                    msg.author.send('Description was never set correctly or user is banned')
                }
            });
        } else if (collector.first().content == 'update') {
            setRobloxData(msg, id, dmC)
        } else {
            msg.author.send('Operation failed!')
            setRobloxData(msg, id, dmC)
        }
    }).catch((e) => msg.author.send('Timeouted, please redo the verify command in the server.'))
}

async function verify(msg) {
    const data = await database.get(`users/${msg.author.id}`)
    if (data['roblox']) {
        msg.author.send('You have already verifyed yourself.')
        return
    }
    const message = await msg.author.send('Please enter your roblox username.')
    let dmC = message.channel
    const filter = collector => collector.author.id === msg.author.id
    const collector = await dmC.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).catch((e) => console.log('Timeouted, please redo the verify command in the server.'))
    if (collector) {
        let username = collector.first().content
        await noblox.getIdFromUsername(username).then((id) => {
            setRobloxData(msg, id, dmC)
        }).catch((e) => {
            msg.author.send('User was not found!')
            verify(msg)
        })

    }
}

async function unverify(msg) {
    const accountData = await database.get(`users/${msg.member.id}`)
    if (accountData['roblox']) {
        msg.channel.send('Are you sure that you wanna delete your roblox connection? (Type yes or no)')
        const filter = collector => collector.author.id === msg.author.id
        const collector = await msg.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).catch((e) => console.log('Timeouted! Did not delete roblox connection.'))
        if (collector) {
            if (collector.first().content.toLowerCase() == 'yes') {
                database.set(`users/${msg.member.id}/roblox`, null)
                msg.channel.send('Successfully deleted your roblox connection.')
            } else if (collector.first().content.toLowerCase() == 'no') {
                msg.channel.send('Did not delete your roblox connection.')
            }
        }
    } else {
        msg.channel.send('You must have a roblox connection in order to delete it.')
    }
}

let ranks = {
    'Administrator': ['881087452863942656'],
    'Staff': ['881087582631510027', '881087417300439040'],
    'Hangout Member': ['881087857509412864', '881087274324987944'],
    'Member': ['881087229982806016'],
}

async function update(member) {
    const id = await database.get(`users/${member.id}/roblox/id`)
    if (id && !member.user.bot) {
        const currentRank = await noblox.getRankInGroup(13681683, id)
        for (let rankId in ranks) {
            for (i in ranks[rankId]) {
                if (member.roles.cache.has(ranks[rankId][i])) {
                    let rankSetId = await noblox.getRole(13681683, rankId)
                    if (currentRank != rankSetId.rank)
                        noblox.setRank(13681683, id, rankId)
                    return
                }
            }
        }

        if (currentRank > 1) {
            noblox.setRank(13681683, id, 'Member')
        }
    }
}

def = {
    'verify': verify,
    'unverify': unverify,
    'update': update
}

module.exports = def