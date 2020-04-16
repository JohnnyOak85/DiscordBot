const moment = require('moment');
const fs = module.require('fs-extra');
const infractorDoc = './lists/muted.json';

module.exports = {
    name: 'mute',
    description: 'Mute a member',
    async execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have permission for this command!');
        const infractor = message.mentions.members.first();
        if (!infractor || !infractor.manageable) return message.reply('you need to mention a valid user!');

        let role = message.guild.roles.cache.find(mR => mR.name === 'Muted');

        if (!role) {
            // Create a role called "Muted"
            role = await message.guild.roles.create({
                data: {
                    name: 'Muted',
                    permissions: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY']
                }
            })
            // Prevent the user from sending messages or reacting to messages
            message.guild.channels.cache.forEach(async (channel, id) => {
                await channel.updateOverwrite(role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                })
                    .catch(err => { throw err });
            });
        }

        if (infractor.roles.cache.has(role.id)) return message.channel.send('This user is already muted!');

        // Get the amount of messages to clear and check if it's valid
        let amount = parseInt(args[1]);
        if (!amount || amount < 1 || amount > 100 || isNaN(amount)) amount = 5;
        // Set the timer
        const time = moment().add(amount, 'minutes').format();

        // Check if the json exist, if it doesn't, create one
        if (!fs.pathExistsSync(infractorDoc)) fs.outputFileSync(infractorDoc, '{}');

        let infractorList = fs.readJsonSync(infractorDoc);
        if (infractorList[infractor.id]) return message.channel.send('This user is already muted!');

        await infractor.roles.add(role);
        
        infractorList[infractor.id] = {
            guild: message.guild.id,
            time: time
        };

        fs.writeJsonSync(infractorDoc, infractorList);

        message.channel.send(`${infractor.user.username} has been muted for ${amount} minutes!`);
    }
}