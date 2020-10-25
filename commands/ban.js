const { start, verifyUser, checkMember, giveStrike, banMember, startTimer, saveList, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'ban',
    description: 'Mention a user and that user will be banned from the server. Can be temporary if provided with a number between 1 and 100.',
    usage: '<user> <number of days> <reason>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(message.member, 'BAN_MEMBERS')) {
                if (checkMember()) {
                    await giveStrike()
                    await banMember()
                    list = startTimer(list, args[1], 'days');
                    await saveList();
                };
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}