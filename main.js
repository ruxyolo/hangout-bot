require('dotenv').config()
const discord = require('discord.js');

const client = new discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS'] });

let token = process.env.token;

let prefix = '!'
let ownerRank = 881087260940959765
let admins = 881087452863942656
let mods = 881087417300439040

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
});

client.on('guildMemberAdd', (member) => {
    console.log(member.displayName + ' joined the server!')
    let role = member.guild.roles.cache.find(role => role.name === 'Member')
    console.log(role.id)
    member.roles.add(role)
});

client.on('guildMemberRemove', (member) => {
    console.log('scared')
})

client.on('messageCreate', (msg) => {
    if (msg.content.substring(0, prefix.length) == prefix) {
        let args = msg.content.substring(prefix.length).split(' ')
        let user = msg.member

        let rank = 0
        console.log(user.roles.cache.find(role => role.name === ownerRank))
        console.log(user.roles.cache.get(ownerRank))
    }
});

// things the bot should do: add role when user joins, assign roles to users, remove users roles, announce, kick, warn, say hello