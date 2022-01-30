const modules = require('./modules')
const database = require('./database')

//level 1
function hello(msg) {
    msg.channel.send(`Hello ${msg.author}!`)
}

function afk(msg) {
    if (msg.member.nickname != undefined) {
        if (msg.member.nickname.substring(0, 5) == '[AFK]')
            msg.member.setNickname(null, 'Un-AFK')
    } else {
        msg.member.setNickname('[AFK] ' + msg.member.user.username, 'AFK')
    }
}

function getMemberCount(msg) {
    let memberCount = msg.guild.memberCount
    msg.channel.send('Members in server: ' + memberCount)
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
            database.set('users/' + member.id + '/warns', '++')
            modules.log(msg.guild, `<@!${msg.member.id}> warned <@!${member.id}>!`)
        } else if (args[1] == 'remove') {
            database.set('users/' + member.id + '/warns', '--')
            modules.log(msg.guild, `<@!${msg.member.id}> removed a warn on <@!${member.id}>!`)
        } else if (args[1] == 'delete') {
            database.set('users' + member.id + '/warns', null)
        }
    }
}

function kick(msg, args) {
    let member = msg.mentions.members.first()
    let rank = modules.getRank(member)

    if (member && rank <= 1) {
        //let user = msg.guild.members.cache.find(user => user.id === member.substring(3, args[1].lenght - 1).toString())
        let reson = 'You were kicked by ' + msg.member.displayName
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
                member.roles.remove(unautherizeRole)
                modules.log(msg.guild, `<@!${msg.member.id}> de-unauthorized <@!${member.id}>!`)
            } else {
                member.roles.add(unautherizeRole)
                modules.log(msg.guild, `<@!${msg.member.id}> unauthorized <@!${member.id}>!`)
            }
        }
    }
}
//level 3

//level 4
function rank(msg, args) {
    let member = msg.mentions.members.first()
    let rank = msg.mentions.roles.first()
    if (args[2] == `<@!${member.user.id}>` && args[3] == `<@&${rank.id}>` && member.roles.highest.position < msg.member.roles.highest.position || member.id == modules.owner) {
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
//level 5
async function createGetRoleReact(msg, args) {
    //channel, content, emoji, role
    let role = msg.mentions.roles.first()
    const channel = msg.mentions.channels.first()
    const message = await channel.send('Test')
    await message.react('💬')
    let num = 0
    database.get('reactions').then((data) => {
        console.log(data)
        if (data != undefined) {
            num = data.lenght
        }
    })

    let data = {
        'emoji': '💬',
        'messageId': message.id,
        'roleId': role.id
    }
    database.set(`reactions/${num}`, data)
}


commands = {
    //1
    'hello': [hello, 1],
    'afk': [afk, 1],
    'members': [getMemberCount, 1],
    //2
    'bulkdelete': [bulk_delete, 2, 2],
    'kick': [kick, 2, 1],
    'warn': [warn, 2, 2],
    'unauthorize': [unautherize, 2, 1],
    //4
    'rank': [rank, 4, 3],
    //5
    //unaccesable
    'create_role_react': [createGetRoleReact, 6, 1]
}

module.exports = commands