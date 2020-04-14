module.exports = {
    name: 'kick',
    description: 'Kick a member',
    execute(message, args) {
        if (!message.member.hasPermission('KICK_MEMBERS')) return message.reply('you do not have permission to kick!');
        const userToKick = message.mentions.members.first();
        if (!userToKick) return message.reply('you need to mention a valid user!');
        else if (!userToKick.kickable) return message.reply('I cannot kick this user!');
        else if (userToKick.user.id == message.author.id) return message.reply('stop kicking yourself!');
        else if (userToKick.hasPermission('KICK_MEMBERS') && !message.member.hasPermission('ADMINISTRATOR')) return message.reply('I cannot kick this user!');

        let reason = args.slice(1).join(' ');
        if (!reason) reason = "No reason provided";

        // userToKick.kick(reason).catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));

        message.channel.send(`${userToKick.user.username} has been kicked! Reason: ${reason}`);
    }
}