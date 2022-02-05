const noblox = require('noblox')
const modules = require('./modules')
const database = require('./database');

let words = ['blue', 'red', 'yellow', 'green', 'purple', 'pink', 'white', 'black'];

async function verify(msg) {
    const data = await database.get(`users/${msg.author.id}`)
    if (data['roblox']) {
        msg.author.send('You have already verifyed yourself.')
        return
    }
    const message = await msg.author.send('Please enter your roblox username.')
    let dmC = message.channel
    const filter = collector => collector.author.id === msg.author.id
    const filter1 = collector => collector.author.id === msg.author.id && collector.content == 'done'
    const collector = await dmC.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).catch((e) => console.log('Timeout'))
    console.log(collector)
    if (collector) {
        console.log('Respomded')
        let username = collector.first().content
        let id = await noblox.getIdFromUsername(username)
        let message = modules.randomize(words)
        await msg.author.send(`Please set your roblox user description to ${message}`)
        dmC.awaitMessages({ filter1, max: 1, time: 1200000, errors: ['time'] }).then(collector => {
            console.log('Responded1s')
            noblox.getPlayerInfo(id).then(info => {
                console.log(info.blurb)
                console.log(message)
                if (info.blurb == message && info.isBanned == false) {
                    const thumbnail = noblox.getPlayerThumbnail(id, "48x48", "png", true, "headshot")
                    modules.sendEmbed(msg.author, info.username, info.blurb, 'GREEN', thumbnail)
                    console.log('User found')
                    msg.author.send('User was found. You may now change your description.')
                    database.set(`/users/${msg.author.id}/roblox`, { username: info.username, id: id })
                } else {
                    msg.author.send('Description was never set correctly or user is banned')
                }
            });
        }).catch((e) => msg.author.send('Timeouted, please redo the :verify command in the server.'))
    }

}

function update(msg) {
    const id = database.get(`users/${msg.member.id}/roblox/`)
}

def = {
    'verify': verify,
    'update': null
}

module.exports = def