module.exports = {
    name: 'clear',
    description: 'Clear lines',
    execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have permission to mute!');
        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100) return message.reply('you have to input a number from 1 to 100!');

        message.channel.bulkDelete(amount + 1, true)
            .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
    }
}