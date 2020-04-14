module.exports = {
    name: 'ban',
    description: 'Ban a member',
    execute(message, args) {
        if (!message.member.hasPermission('BAN_MEMBERS')) return message.reply('you do not have permission to ban!');
        const userToBan = message.mentions.members.first();
        if (!userToBan) return message.reply('you need to mention a valid user!');
        else if (!userToBan.bannable) return message.reply("I cannot ban this user!");
        else if (userToBan.user.id == message.author.id) return message.reply('you cannot ban yourself!');

        let reason = args.slice(1).join(' ');
        if (!reason) reason = "No reason provided";

        // userToBan.ban(reason).catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));

        message.channel.send(`${userToBan.user.username} has been banned! Reason: ${reason}`);
    }
}