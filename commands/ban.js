module.exports = {
    name: 'ban',
    description: 'Ban a member',
    execute(message, args) {
        if (!message.member.hasPermission('BAN_MEMBERS')) return message.reply('you do not have permission for this command!');
        const infractor = message.mentions.members.first();
        if (!infractor || !infractor.manageable) return message.reply('you need to mention a valid user!');

        let reason = `Reason: ${args.slice(1).join(' ')}`;
        if (!reason) reason = 'None provided';

        // infractor.ban(reason).catch(error => message.reply(`Sorry I couldn't execute this command because of : ${error}`));

        message.channel.send(`${infractor.user.username} has been banned!\n${reason}`);
    }
}