module.exports = {
    name: 'mute',
    description: `Mention a user and that user won't be able to send messages. Can be temporary if provided with a number between 1 and 100.`,
    usage: '<user> <number of minutes>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                const role = await commandHelper.ensureRole('muted').catch(err => { throw err; });
                await commandHelper.addRole(role);

                let list = await commandHelper.updateList();

                commandHelper.setReply(`${infractor.user.username} has been muted.\n${commandHelper.getReason()}`);
                commandHelper.setReason(`Muted! ${commandHelper.getReason()}`);

                list = await commandHelper.startTimer(list, args[1], 'minutes');
                await commandHelper.saveList(list);
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}