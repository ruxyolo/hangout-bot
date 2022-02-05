const discord = require('discord.js');
const { set } = require('firebase/database');
const client = new discord.Client({ intents: ["GUILDS"] });

let colors = { 'black': '#000000', 'white': '#ffffff', 'green': '#4de705', 'lightBlue': '#28ecff' };
let defaultColor = colors.black

async function getRespond(channel) {

}

async function announce(msg, msgArgs, channelSend) {
    if (msgArgs[2] == 'colors') {
        msg.channel.send(colors.toString())
        return
    }
    const channel = msg.channel
    let timestamp = new Date().toISOString()
    let msgContent = ''
    const fields = [];
    let settings = { title: [null, true], description: [null, false], color: [null, false], url: [null, false, true], thumb: [null, false, true], footer: [null, false] };
    //content ?||&& title, ?desc, ?col, ?thumb, ?footer, ?timestamp, ?fields
    let filter = m => m.member.id === msg.member.id
    await channel.send('`Please send the content or n to skip.`')
    let collector = await channel.awaitMessages({ filter, max: 1, time: 240000, errors: ['time'] }).catch(() => console.log('Timeout'))
    if (collector) {
        if (collector.first().content != 'n') {
            msgContent = collector.first().content
        }
        channel.send('Note that skipping the title will close the operation or when not using "https://" on URL or thumb!')
        for (i in settings) {
            let setting = settings[i]
            await channel.send('`Please send the ' + i + ' or type n to skip.`')
            let respond = await channel.awaitMessages({ filter, max: 1, time: 240000, errors: ['time'] }).catch(() => console.log('Timeout'))
            if (respond) {
                if (respond.first().content != 'n') {
                    if (setting[2]) {
                        if (respond.first().content.substring(0, 8) != 'https://') {
                            channel.send(setting + ' has to be a https url.')
                            break
                        }
                    }
                    console.log(settings[i])
                    console.log(respond.first().content)
                    settings[i][0] = respond.first().content

                } else {
                    if (i == 'title') {
                        channel.send('A title is required for an embed!')
                        break
                    }
                    settings[i][0] = undefined
                }
            } else {
                channel.send('Timeout.')
                return
            }
        }

        if (!settings['color'][0]) {
            settings['color'][0] = defaultColor
        }

        while (true) {
            channel.send('`Write field name and value with ",, " as seperator or type n to skip.`')
            const field = await channel.awaitMessages({ filter, max: 1, time: 240000, errors: ['time'] }).catch(() => console.log('Timeout'))
            if (field) {
                if (field.first().content == 'n') {
                    channel.send('**Sending embed!**')
                    break
                }
                let args = field.first().content.split(',, ')
                if (args[0] && args[1]) {
                    let data = { 'name': args[0], 'value': args[1] }
                    fields.push(data)
                } else {
                    channel.send('Name or field is empyt!')
                    return
                }
            } else {
                channel.send('Timeout.')
                return
            }
        }

        try {
            let embed = new discord.MessageEmbed()
            if (settings['title'][0] == undefined) {
                embed = undefined
            } else {
                for (i in settings) {
                    if (settings[i][0] != undefined || settings[i][0] != null) {
                        let func = i.substring(0, 1).toUpperCase() + i.substring(1)
                        embed['set' + func](settings[i][0])
                    }
                }
                embed.setTimestamp(timestamp)
                if (fields) {
                    embed.addFields(fields)
                }
            }
            console.log(embed)
            if (embed) {
                channelSend.send({ content: msgContent || undefined, embeds: [embed] || undefined }).catch((e) => {
                    console.warn(e)
                    channel.send('Something went wrong when trying to send the embed!')
                });
            } else {
                channelSend.send({ content: msgContent || undefined }).catch((e) => {
                    console.warn(e)
                    channel.send('Something went wrong when trying to send the message!')
                });
            }
        } catch (e) {
            console.warn(e)
            msg.channel.send('Something went wrong when trying to send the embed/message!')
        }
    } else {
        channel.send('Timeout.')
        return
    }
}


def = {
    'announce': announce
}

module.exports = def