require('dotenv').config()
const discord = require('discord.js');
const modules = require('./modules')
const commandData = require('./commandRun')
const database = require('./database')
const noblox = require('noblox.js')
const robloxVerify = require('./commandScripts/robloxVerify')

const client = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILD_VOICE_STATES", "GUILD_MESSAGE_REACTIONS", "GUILD_INVITES"] });

let token = process.env.token;

let prefix = '!'


let ranks = {
    1: ['member', '881087229982806016'],
    2: ['moderator', '881087417300439040'],
    3: ['admin', '881087452863942656'],
    4: ['headadmin', '881087515581354004'],
    5: ['ruxyolo', '881087260940959765']
}

client.login(token)
let guild = undefined

function addUser(member) {
    database.set('/users/' + member.user.id + '/username', member.user.username)
    if (member.user.bot == true) {
        console.log('Is bot')
        database.set(`/users/${member.user.id}/bot`, true)
        database.set(`/historical/bots/${member.user.id}/username`, member.user.username)
        database.set(`historical/bots/${member.id}/joinedTimestamp`, member.joinedTimestamp)
    } else {
        database.set(`/users/${member.user.id}/bot`, false)
        database.set(`/historical/users/${member.user.id}/username`, member.user.username)
        database.set(`historical/users/${member.id}/joinedTimestamp`, member.joinedTimestamp)
    }
    member.roles.cache.forEach(role => {
        database.set(`/users/${member.user.id}/roles/${role.id}`, role.name)
    })
}

function prefixUpdater(key, value) {
    if (key == 'prefix' && value != prefix) {
        prefix = value
        modules.log(guild, 'Prefix has been update to: ' + value)
        const bot = guild.members.cache.get(client.user.id)
        bot.setNickname(`(${prefix}) ${client.user.username}`)
    }
}

client.on('ready', async() => {
    if (modules.maintenanceMode == true) {
        client.user.setStatus('idle')
    } else {
        client.user.setStatus('online')
    }
    modules.setClient(client)
    robloxVerify.login()
    console.log('Bot is online!')
    console.log('Discord verision: ' + discord.version)

    guild = client.guilds.cache.find(guild => guild.id === '881086913925251102')
    let string = ''
    for (let i = 0; i < token.length - 40; i++) {
        string = `${string}*`
    }
    string = string + token.substring(token.length - 10)
    console.log('Client token: ' + string)

    guild.members.cache.forEach(member => {
        database.get('users/' + member.id).then((data) => {
            if (data == undefined) {
                addUser(member)
            }
        })
    });
    database.get('users').then((user) => {
        for (id in user) {
            if (!guild.members.cache.get(id)) {
                database.set('users/' + id, null)
            }
        }
    })
    prefix = await database.get('/prefix')
    database.eventListener('', 'prefix', prefixUpdater)
    modules.log(guild, 'Hangout Bot has started!')
});

client.on('guildMemberAdd', async(member) => {
    console.log(member.displayName + ' joined the server!')
    let role = member.guild.roles.cache.find(role => role.name === 'Member')
    if (!member.user.bot) {
        member.roles.add(role)
    }
    addUser(member)
});

client.on('guildMemberRemove', (member) => {
    console.log('Member left server')
    database.set('users/' + member.user.id, null)
});

async function getMessageFromReactions(msg) {
    let reactions = await database.get('/reactions')
    if (reactions) {
        for (i in reactions) {
            if (reactions[i]['messageId'] == msg.id) {
                return i
            }
        }
        return false
    }
    return false
}

//Reaction giving role
client.on('messageReactionAdd', async(reaction, user) => {
    let correctMessage = await getMessageFromReactions(reaction.message)
    if (typeof(correctMessage) == 'string' && !user.bot) {
        let roleId = await database.get('/reactions/' + correctMessage + '/roleId')
        let member = guild.members.cache.get(user.id)
        if (member) {
            let role = guild.roles.cache.find(role => role.id === roleId)
            member.roles.add(role)
        }
    }
})
client.on('messageReactionRemove', async(reaction, user) => {
    let correctMessage = await getMessageFromReactions(reaction.message)
    if (typeof(correctMessage) == 'string' && !user.bot) {
        let roleId = await database.get('/reactions/' + correctMessage + '/roleId')
        let member = guild.members.cache.get(user.id)
        let role = guild.roles.cache.get(roleId)
        if (member.roles.cache.has(roleId)) {
            member.roles.remove(role)
        }
    }
})
client.on('messageDelete', async(msg) => {
    let correctMessage = await getMessageFromReactions(msg)
    console.log('Message deleted')
    console.log(typeof(correctMessage))
    if (typeof(correctMessage) == 'string') {
        database.set('/reactions/' + correctMessage, null)
    }
})

//Message Create (command)
async function checkArgs(member, rank, d) {
    let result = false
    if (typeof(d) == 'number') {
        if (member.roles.highest.position >= rank) {
            result = true
        }
    } else if (typeof(d) == 'string') {
        if (member.roles.cache.has(d)) {
            result = true
        } else if (member.id == d) {
            result = true
        }
    } else if (typeof(d) == 'object') {
        for (i in d) {
            if (member.roles.cache.has(d[i])) {
                result = true
                break
            }
        }
    }
    if (member.id == modules.owner) {
        result = true
    }
    return result
}

client.on('messageCreate', async(msg) => {
    if (modules.disabled == false || msg.member.id == modules.owner) {
        if (msg.content.substring(0, prefix.length) == prefix && msg.author.bot == false && !msg.author.dmChannel) {
            let args = msg.content.substring(prefix.length).split(' ')
            let rank = modules.getRank(msg.member)

            let commands = commandData
            for (i in commands) {
                if (args[0] == i) {
                    let auth = await checkArgs(msg.member, rank, commands[i][1])
                    if (auth == true) {
                        if (!msg.member.roles.cache.has('881087939638071346')) {
                            if (commands[i][2]) {
                                let num = commands[i][2]
                                if (typeof(commands[i][2]) == 'object') {
                                    num = commands[i][2].length
                                }

                                for (let i = 0; i < num; i++) {
                                    if (args[i] == undefined && args[i].substring(0, 3) != '%o%') {
                                        msg.channel.send('Missing argument(s)')
                                        return
                                    }
                                }
                                let checks = ['role', 'member', 'channel']
                                for (arg in commands[i][2]) {
                                    for (c in checks) {
                                        c = checks[c]
                                        if (commands[i][2][arg] == c) {
                                            console.log(msg.mentions[c + 's'])
                                            if (!msg.mentions[c + 's'].first()) {
                                                msg.channel.send(c + ' was never mentioned in message or ' + c + ' does not exist in the server.')
                                                return
                                            }
                                        }
                                    }
                                }
                            }
                            if (commands[i][3] == true && msg.member.id != modules.owner) {
                                msg.channel.send('That command is disabled!')
                            } else {
                                commands[i][0](msg, args, client)
                            }
                            return
                        }
                    } else {
                        msg.channel.send('You do not have autherazation to use that command!')
                        return
                    }
                }
            }
            msg.channel.send('Command not found!')
        }
        //commands to add: !trust, -!kick, !timeout, -!hello, -!notalk, -!announce, -!warn, -!unautherize
    }
});

//Livesteam
function eventChannel(connected, state) {
    let member = state.member
    let eventChannels = modules.eventChannels
    let talkRole = member.guild.roles.cache.get(modules.talkRoleId)
    console.log(modules.talkRoleId)
    for (i in eventChannels) {
        if (state.channel.id == eventChannels[i]) {
            if (connected == true) {
                console.log('Join')
                if (member.roles.highest.position < talkRole.position) {
                    member.roles.add(talkRole)
                }
            } else {
                if (member.roles.cache.find(role => role.id === modules.talkRoleId)) {
                    console.log('Removed')
                    member.roles.remove(talkRole)
                }
            }
            return
        }
    }
}

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.channel) {
        eventChannel(true, newState)
    } else if (oldState.channel) {
        eventChannel(false, oldState)
    }
});

//Member role update
function updateDatabaseUserRoles(newMember, oldMember) {
    robloxVerify.update(newMember)
    if (newMember.roles.cache.get('881155355533525002') || oldMember.roles.cache.get('881155355533525002') || newMember.roles.cache.has('881087939638071346') || oldMember.roles.cache.has('881087939638071346')) {
        return
    } else {
        database.set(`/users/${newMember.user.id}/roles/`, null)
        newMember.roles.cache.forEach(role => {
            database.set(`/users/${newMember.user.id}/roles/${role.id}`, role.name)
        })
    }
}

client.on('guildMemberUpdate', (oldMember, newMember) => {
    for (i in newMember['_roles']) {
        if (oldMember['_roles'][i]) {
            if (oldMember['_roles'][i] == newMember['_roles'][i]) {
                //do nothing
            } else {
                updateDatabaseUserRoles(newMember, oldMember)
                break
            }
        } else {
            updateDatabaseUserRoles(newMember, oldMember)
            break
        }
    }
});
// things the bot should do: add role when user joins, assign roles to users, remove users roles, announce, kick, warn, say hello

//change database when memberupdate add member when join and under history path, remove member from database when memberreoving and add all new members no bot start