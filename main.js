require('dotenv').config()
const discord = require('discord.js');
const modules = require('./modules')
const commandData = require('./commandRun')
const database = require('./database')

const client = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS"] });

let token = process.env.token;

let prefix = ':'

let ranks = {
    1: ['member', '881087229982806016'],
    2: ['moderator', '881087417300439040'],
    3: ['admin', '881087452863942656'],
    4: ['headadmin', '881087515581354004'],
    5: ['ruxyolo', '881087260940959765']
}

client.login(token)

client.on('ready', () => {
    client.user.setStatus('idle')
    console.log('Bot is online!')
    console.log('Discord verision: ' + discord.version)

    let string = ''
    for (let i = 0; i < token.length - 40; i++) {
        string = `${string}*`
    }
    string = string + token.substring(token.length - 10)
    console.log('Client token: ' + string)

    const guild = client.guilds.cache.find(guild => guild.id === '881086913925251102')
    guild.members.cache.forEach(member => {
        database.get('users/' + member.user.id).then((data) => {
            if (data == undefined) {
                database.set('/users/' + member.user.id + '/username', member.user.username)
                if (member.user.bot == true) {
                    console.log('Is bot')
                    database.set(`/users/${member.user.id}/bot`, true)
                } else {
                    database.set(`/users/${member.user.id}/bot`, false)
                    database.set(`/histoical/${member.user.id}/username`, member.user.username)
                }
            }
        })
    });
});

client.on('guildMemberAdd', (member) => {
    console.log(member.displayName + ' joined the server!')
    let role = member.guild.roles.cache.find(role => role.name === 'Member')
    member.roles.add(role)
    database.set('/users/' + member.user.id + '/username', member.user.username)
    if (member.user.bot == true) {
        console.log('Is bot')
        database.set(`/users/${member.user.id}/bot`, true)
    } else {
        database.set(`/users/${member.user.id}/bot`, false)
        database.set(`/histoical/${member.user.id}/username`, member.user.username)
    }
});

client.on('guildMemberRemove', (member) => {
    console.log('Member left server')
    database.set('users/' + member.user.id, null)
});

function checkCommand(member, rank, commands) {

}
client.on('messageReactionAdd', (r) => {
    console.log('Reaction events')
})
client.on('messageCreate', (msg) => {
    if (msg.content.substring(0, prefix.length) == prefix && msg.author.bot == false) {
        let args = msg.content.substring(prefix.length).split(' ')
        let user = msg.member
        let rank = modules.getRank(msg.member)

        console.log('Users rank name: ' + ranks[rank][0])
        let commands = commandData
        for (i in commands) {
            if (args[0] == i) {
                if (typeof(commands[i][1]) == 'number') {
                    if (rank >= commands[i][1] && !msg.member.roles.cache.find(role => role.id === '881087939638071346')) {
                        if (commands[i][2]) {
                            let f = 0
                            let num = commands[i][2]
                            for (let i = 0; i < num; i++) {
                                if (args[i] != undefined) {
                                    f++
                                }
                            }
                            if (f == commands[i][2]) {
                                commands[i][0](msg, args)
                                break
                            }
                        } else {
                            commands[i][0](msg, args)
                            break
                        }
                    }
                } else if (typeof(commands[i][1]) == 'string') {
                    console.log('Coming soon')
                }
            }
        }
        //commands to add: !trust, !kick, !timeout, !hello, !notalk, !announce, !warn, !unautherize
    }
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
    console.log('Member update!')
});
// things the bot should do: add role when user joins, assign roles to users, remove users roles, announce, kick, warn, say hello

//change database when memberupdate add member when join and under history path, remove member from database when memberreoving and add all new members no bot start