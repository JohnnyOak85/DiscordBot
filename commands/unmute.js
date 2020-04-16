const fs = module.require('fs-extra');
const infractorDoc = './lists/muted.json';

module.exports = {
    name: 'unmute',
    description: 'Unmute a member',
    async execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have permission for this command!');
        const infractor = message.mentions.members.first();
        if (!infractor || !infractor.manageable) return message.reply('you need to mention a valid user!');
        
        const mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted');
        if (!mutedRole || !infractor.roles.cache.has(mutedRole.id)) return message.channel.send('This user is not muted!');

        if (!fs.pathExistsSync(infractorDoc)) return message.channel.send('I have no record of muted users');
        const infractorList = fs.readJsonSync(infractorDoc);

        if (!infractorList[infractor.id]) return message.channel.send('This user is not muted!');

        await infractor.roles.remove(mutedRole);
        delete infractorList[infractor.id];
        fs.writeJsonSync(infractorDoc, infractorList);

        message.channel.send(`${infractor.user.username} has been unmuted!`);
    }
}