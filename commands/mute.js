const moment = require('moment');
const fs = module.require('fs-extra');
const muteListUrl = './lists/muted.json';

module.exports = {
    name: 'mute',
    description: 'Mute a member',
    async execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have permission to mute!');
        const userToMute = message.mentions.members.first();
        if (!userToMute) return message.reply('you need to mention a valid user!');
        else if (userToMute.user.id == message.author.id) return message.reply('stop shushing yourself!');
        else if (userToMute.hasPermission('MANAGE_MESSAGES') && !message.member.hasPermission('ADMINISTRATOR')) return message.reply('I cannot mute this user!');

        let mutedRole = message.guild.roles.cache.find(mR => mR.name === 'Muted');

        if (!mutedRole) {
            // Create a role called "Muted"
            mutedRole = await message.guild.roles.create({
                data: {
                    name: 'Muted',
                    permissions: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY']
                }
            })
            // Prevent the user from sending messages or reacting to messages
            message.guild.channels.cache.forEach(async (channel, id) => {
                await channel.updateOverwrite(mutedRole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                })
                    .catch(err => { throw err });
            });
        }

        if (userToMute.roles.cache.has(mutedRole.id)) return message.channel.send('This user is already muted!');

        // Set the timer
        let time = args[1];
        if (isNaN(parseInt(time))) time = 5;

        // Check if the json exist, if it doesn't, create one
        if (!fs.pathExistsSync(muteListUrl)) fs.outputFileSync(muteListUrl, '{}');

        let mutedList = fs.readJsonSync(muteListUrl);

        if (mutedList[userToMute.id]) return message.channel.send('This user is already muted!');

        await userToMute.roles.add(mutedRole);

        mutedList[userToMute.id] = {
            guild: message.guild.id,
            time: moment().add(time, 'minutes').format()
        };

        fs.writeJsonSync(muteListUrl, mutedList);
        
        message.channel.send(`${userToMute.user.username} has been muted for ${time} minutes!`);
    }
}