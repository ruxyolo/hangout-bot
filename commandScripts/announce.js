const discord = require('discord.js');

let colors = { 'black': '#000000', 'white': '#ffffff', 'green': '#4de705', 'lightBlue': '#28ecff' };
let defaultColor = colors.black

async function getField(channel, filter) {
    return new Promise(async(resolve, reject) => {
        channel.send('`Write field name and value with ",, " as seperator or type n to skip.`')
        const field = await channel.awaitMessages({ filter, max: 1, time: 240000, errors: ['time'] }).catch(() => console.log('Timeout'))
        if (field) {
            if (field.first().content == 'n') {
                resolve(false)
                return
            }
            let args = field.first().content.split(',, ')
            if (args[0] && args[1]) {
                let data = { 'name': args[0], 'value': args[1] }
                resolve(data)
                return
            } else {
                channel.send('Name or field is empty!')
                getField(channel)
                return
            }
        } else {
            channel.send('Timeout.')
            getField(channel)
            return
        }
    })
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
            if (collector.first().content.length > 2000) {
                channel.send('Content is larger then 200 characters.')
                announce(msg, msgArgs, channelSend)
                return
            }
            msgContent = collector.first().content
        }
        channel.send('Note that skipping the title will close the embed operation or when not using "https://" on URL or thumb!')
        for (i in settings) {
            let setting = settings[i]
            await channel.send('`Please send the ' + i + ' or type n to skip.`')
            let respond = await channel.awaitMessages({ filter, max: 1, time: 240000, errors: ['time'] }).catch(() => console.log('Timeout'))
            if (respond) {
                if (respond.first().content != 'n') {
                    if (collector.first().content.length > 2000) {
                        channel.send('Content is larger then 200 characters.')
                        announce(msg, msgArgs, channelSend)
                        return
                    }
                    if (setting[2]) {
                        if (respond.first().content.substring(0, 8) != 'https://') {
                            channel.send(setting + ' has to be a https url.')
                            announce(msg, msgArgs, channelSend)
                        }
                    }
                    settings[i][0] = respond.first().content
                } else if (respond.first().content == 'CANCELOP') {
                    channel.send('Closing operating!')
                    return
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
        if (settings['title'][0]) {
            while (true) {
                let field = await getField(channel, filter)
                if (field == false) {
                    break
                } else if (field) {
                    fields.push(field)
                }
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
            channel.send('**Sending embed!**')
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