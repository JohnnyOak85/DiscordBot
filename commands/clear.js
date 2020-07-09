module.exports = {
    name: 'clear',
    description: 'Clear a set amount of lines from 1 to 100.',
    usage: '<number of lines>',
    moderation: true,
    execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            let amount = commandHelper.getNumber(args[0]);
            if (!amount) {
                message.channel.send('I need a number from 1 to 100.');
                return;
            }
            message.channel.bulkDelete(amount + 1, true)
                .catch(error => { throw error });
        }
    }
}