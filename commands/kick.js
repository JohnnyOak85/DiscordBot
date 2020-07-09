module.exports = {
    name: 'kick',
    description: 'Mention a user and that user gets removed from the server.',
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('KICK_MEMBERS')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                await infractor.kick(commandHelper.getReason()).catch(error => { throw error });

                delete list[infractor.id].roles;
                
                commandHelper.setReply(`${infractor.user.username} has been kicked. ${commandHelper.getReason()}`);
                commandHelper.setReason(`Kicked! ${commandHelper.getReason()}`);

                const list = await commandHelper.updateList();
                await commandHelper.saveList(list);
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}