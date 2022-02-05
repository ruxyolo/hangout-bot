const modules = require('./modules')
const database = require('./database')
const robloxVerify = require('./robloxVerify')
const announceScript = require('./announce')

//level 1
function hello(msg) {
    msg.channel.send(`Hello ${msg.author}!`)
}

function afk(msg) {
    if (msg.member.roles.highest.position <= msg.guild.roles.cache.get('937049587426942996').position) {
        if (msg.member.nickname != undefined) {
            if (msg.member.nickname.substring(0, 5) == '[AFK]')
                msg.member.setNickname(null, 'Un-AFK')
        } else {
            msg.member.setNickname('[AFK] ' + msg.member.user.username, 'AFK')
        }
    } else {
        msg.channel.send('You are to powerful for me to change your nickname.')
    }
}

function getMemberCount(msg) {
    let memberCount = msg.guild.memberCount
    msg.channel.send('Members in server: ' + memberCount)
}

async function verifyRoblox(msg, args) {
    robloxVerify.verify(msg)
}

async function getWeather(msg, args) {
    let weather = await modules.get(`https://api.weatherbit.io/v2.0/current?city=${msg.content.substring(args[0]+args[1]+2)}&country=${args[1]}&key=1f2291569b9d468ca7bf22612c3c4627`)
    if (weather) {
        weather = weather['data'][0]
        let fields = [
            { name: 'Temperature (C)', value: weather['temp'].toString() },
            { name: 'Pressure (mb)', value: weather['pres'].toString() },
            { name: 'Clouds (%)', value: weather['clouds'].toString() },
            { name: 'Wind speed (m/s)', value: weather['wind_spd'].toString() }
        ]
        modules.sendEmbed(msg.channel, 'Weather for ' + weather['city_name'], 'Weather data: ', null, null, fields, { text: 'Powerd by weatherbit.io' }, weather['ob_time'])
    }
}

//level 2
function bulk_delete(msg, args) {
    const channel = msg.mentions.channels.first()
    if (channel && args[1] == `<#${channel.id}>`) {
        try {
            channel.bulkDelete(Number(args[2]) + 1)
        } catch (e) {
            console.warn(e)
        }
    }
}

function warn(msg, args) {
    if (msg.mentions.members.first()) {
        let member = msg.mentions.members.first()
        if (args[1] == 'add') {
            console.log('Adding warn')
            modules.log(msg.guild, `<@!${msg.member.id}> warned <@!${member.id}>!`)
            database.set('users/' + member.id + '/warns', '++')
        } else if (args[1] == 'remove') {
            modules.log(msg.guild, `<@!${msg.member.id}> removed a warn on <@!${member.id}>!`)
            database.set('users/' + member.id + '/warns', '--')
        } else if (args[1] == 'delete') {
            modules.log(msg.guild, `<@!${msg.member.id}> removed all warnings on <@!${member.id}>!`)
            database.set('users' + member.id + '/warns', null)
        }
    }
}

function kick(msg, args) {
    let member = msg.mentions.members.first()
    let rank = modules.getRank(member)

    if (member && rank <= 1 || msg.member.id == modules.owner) {
        for (i in modules.unkickables) {
            if (member.id == modules.unkickables[i]) {
                msg.channel.send('Mentioned member is unkickabel!')
                return
            }
        }
        //let user = msg.guild.members.cache.find(user => user.id === member.substring(3, args[1].lenght - 1).toString())
        let reson = 'You were kicked by ' + msg.member.user.username + '#' + msg.member.user.discriminator
        if (args[2]) {
            reson = args[2]
        }
        member.kick(reson).then(() => {
            modules.log(msg.guild, `<@!${msg.member.id}> kicked <@!${member.id}>!`)
            msg.channel.send('**Successfully kicked ' + member.user.tag + '**')
        })

    }
}

function unautherize(msg, args) {
    let member = msg.mentions.members.first()
    let unautherizeRole = msg.guild.roles.cache.find(role => role.id === '881087939638071346')

    if (member != undefined) {
        if (args[2] == `<@!${member.user.id}>` && member.roles.highest.position > msg.member.roles.highest.position || member.id == modules.owner) {
            if (member.roles.cache.find(role => role === unautherizeRole)) {
                let oldRoles = database.get(`users/${member.id}/roles`)
                for (id in oldRoles) {
                    let role = member.guild.roles.cache.get(id)
                    member.add(role)
                }
                member.roles.remove(unautherizeRole)
                modules.log(msg.guild, `<@!${msg.member.id}> de-unauthorized <@!${member.id}>!`)
            } else {
                member.roles.add(unautherizeRole)
                member.roles.cache.forEach(role => {
                    member.roles.remove(role)
                })
                modules.log(msg.guild, `<@!${msg.member.id}> unauthorized <@!${member.id}>!`)
            }
        }
    }
}

function talk(msg) {
    let member = msg.metions.members.first()

    if (member) {
        if (member.roles.cache.has(modules.talkRoleId)) {
            member.roles.remove(modules.talkRoleId)
        } else {
            member.roles.add(modules.talkRoleId)
        }
    }
}
//level 3

//level 4
function rank(msg, args) {
    let member = msg.mentions.members.first()
    let rank = msg.mentions.roles.first()
    if (args[2] == `<@!${member.user.id}>` && args[3] == `<@&${rank.id}>` && member.roles.highest.position < msg.member.roles.highest.position || member.id == modules.owner) {
        for (i in modules.disabledRoles) {
            if (modules.disabledRoles[i] == rank.id) {
                msg.channel.send('Mentioned role is forbiden to use with the bot.')
                return
            }
        }
        if (args[1] == 'add') {
            member.roles.add(rank)
            modules.log(msg.guild, `<@!${msg.member.id}> added <@&${rank.id}> to <@!${member.id}>!`)
        } else if (args[1] == 'remove') {
            if (member.roles.cache.find(rank => rank === rank)) {
                member.roles.remove(rank)
                modules.log(msg.guild, `<@!${msg.member.id}> removed <@&${rank.id}> to <@!${member.id}>!`)
            }
        }
    }
}

function announce(msg, args) {
    let channel = msg.mentions.channels.first()
    if (args[1] == `<#${channel.id}>`) {
        if (msg.channel.id == '939164585968152667' || msg.member.id == modules.owner)
            announceScript.announce(msg, args, channel)
    }
}
//level 5
async function createGetRoleReact(msg, args) {
    //channel, emoji, role, content
    const role = msg.mentions.roles.first()
    const channel = msg.mentions.channels.first()
    if (role && channel) {
        if (args[1] == `<#${channel.id}>` && args[4] && args[3] == `<@&${role.id}>`) {
            const search = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi
            if (search.test(args[2])) {
                let len = args[0].length + args[1].length + args[2].length + args[3].length + 5
                let messageToSend = msg.content.substring(len)
                const message = await channel.send(messageToSend)
                await message.react(args[2])
                let num = 0
                database.get('reactions').then((data) => {
                    console.log(data)
                    if (data != undefined) {
                        data
                    }
                })

                let data = {
                    'emoji': '💬',
                    'channelId': channel.id,
                    'messageId': message.id,
                    'roleId': role.id
                }
                database.set(`reactions/${num}`, data)
            } else {
                msg.channel.send('Argument 3 is not a vaild emoji.')
            }
        }
    } else {
        msg.channel.send('Missing channel, content or role.')
    }
}

function prefix(msg, args) {
    console.log(args[1].length)
    if (args[1].length <= 2) {
        database.set('/prefix', args[1])
        console.log('Changing prefix')
    } else {
        msg.channel.send('Prefix may only be under 2 characters.')
    }
}


function getCommandInfo(msg, args) {
    if (commands[args[1]]) {
        let cmd = commands[args[1]]
        let rank = modules.getRank(msg.member)
        if (cmd[1] <= rank) {
            let cmdArgs = ''
            if (cmd[2]) {
                for (i in cmd[2]) {
                    cmdArgs = cmdArgs + '`' + cmd[2][i] + '`, '
                }
            } else {
                cmdArgs = 'NONE'
            }
            msg.channel.send(args[1] + ' has arguments: ' + cmdArgs)
        } else {
            msg.channel.send('You do not have access to that command!')
        }
    }
}

commands = {
    //All access
    'info': [getCommandInfo, 0, ['command']],
    //1
    'hello': [hello, 1],
    'afk': [afk, 1],
    'members': [getMemberCount, 1],
    'verify': [verifyRoblox, 1],
    'weather': [getWeather, 1, ['conuntry', 'city']],
    //2
    'bulkdelete': [bulk_delete, 2, ['channel', 'messages']],
    'kick': [kick, 2, ['member']],
    'warn': [warn, 2, ['operation', 'member']],
    'unauthorize': [unautherize, 2, ['member']],
    'talk': [talk, 2, ['member']],
    //4
    'rank': [rank, 4, ['operation', 'member', 'role']],
    'announce': [announce, 4, 1],
    //5
    'prefix': [prefix, 4, 1],
    //unaccesable
    'create_role_react': [createGetRoleReact, 5, 4]
}

module.exports = commands

//main_cmd: [func, [rank: int, user: user, role: role], [args1_name, args2_name, args3_name, ...]]