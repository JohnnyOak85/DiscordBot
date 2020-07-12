module.exports = {
    name: 'mute',
    description: `Mention a user and that user won't be able to send messages. Can be temporary if provided with a number between 1 and 100.`,
    usage: '<user> <number of minutes>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
            if (commandHelper.checkMember()) {
                try {
                    await commandHelper.giveStrike();
                    await commandHelper.addRole('muted');
                } catch { error => { throw error } };

                await commandHelper.startTimer(args[1], 'minutes');
                await commandHelper.saveList();
            };
        }
        message.channel.send(commandHelper.getReply())
            .catch(err => { throw err; });
    }
}