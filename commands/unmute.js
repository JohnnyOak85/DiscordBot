const moment = require('moment');
const fs = module.require('fs-extra');
const muteListUrl = './lists/muted.json';

module.exports = {
    name: 'unmute',
    description: 'Unmute a member',
    async execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have permission to unmute!');
        const userToUnmute = message.mentions.members.first();
        if (!userToUnmute) return message.reply('you need to mention a valid user!');
        else if (userToUnmute.hasPermission('MANAGE_MESSAGES') && !message.member.hasPermission('ADMINISTRATOR')) return message.reply('I cannot unmute this user!');
        
        const mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted');

        if (!mutedRole || !userToUnmute.roles.cache.has(mutedRole.id)) return message.channel.send('This user is not muted!');

        if (!fs.pathExistsSync(muteListUrl)) return message.channel.send('I have no record of muted users');
        let mutedList = fs.readJsonSync(muteListUrl);

        if (!mutedList[userToUnmute.id]) return message.channel.send('This user is not muted!');

        await userToUnmute.roles.remove(mutedRole);
        delete mutedList[userToUnmute.id];
        fs.writeJsonSync(muteListUrl, mutedList);

        message.channel.send(`${userToUnmute.user.username} has been unmuted!`);
    }
}