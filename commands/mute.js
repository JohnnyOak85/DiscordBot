const { start, verifyUser, checkMember, giveStrike, addRole, startTimer, saveList, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'mute',
    description: `Mention a user and that user won't be able to send messages. Can be temporary if provided with a number between 1 and 100.`,
    usage: '<user> <number of minutes> <reason>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (checkMember()) {
                    await giveStrike();
                    await addRole('muted');
                    startTimer(args[1], 'minutes');
                    await saveList();
                };
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}