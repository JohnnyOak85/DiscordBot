module.exports = {
    name: 'clear',
    description: 'Clear lines',
    execute(message, args) {
        // Check if the user that issued the command has permissions
        commandHelper.hasPermission(message, 'MANAGE_MESSAGES');

        // Get the amount of messages to clear and check if it's valid
        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100)
            return message.reply('you have to input a number from 1 to 100!');

        // Delete the messages
        message.channel.bulkDelete(amount + 1, true)
            .catch(error => { throw error });
    }
}