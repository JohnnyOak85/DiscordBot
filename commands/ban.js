module.exports = {
    name: 'ban',
    description: 'Mention a user and that user will be banned from the server. Can be temporary if provided with a number between 1 and 100.',
    usage: '<user> <number of days> <reason>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('BAN_MEMBERS')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                await infractor.ban(commandHelper.getReason()).catch(error => { throw error });
                let list = await commandHelper.updateList();
                list[infractor.id].banned = true;
                delete list[infractor.id].roles;
                
                commandHelper.setReply(`${infractor.user.username} has been banned.\n${commandHelper.getReason()}`);
                commandHelper.setReason(`Banned! ${commandHelper.getReason()}`);

                list = await commandHelper.startTimer(list, args[1], 'days');
                await commandHelper.saveList(list);
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}