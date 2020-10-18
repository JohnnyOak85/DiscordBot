module.exports = {
    name: 'banned',
    description: 'Lists all the users that have been banned.',
    usage: ' ',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);
            if (commandHelper.verifyUser(message.member, 'BAN_MEMBERS')) {
                const list = await commandHelper.getBansList()
                commandHelper.setReply(buildReply(list));
            }
            await commandHelper.sendReply(message.channel, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}

function buildReply(list) {
    let reply = '';

    if (!list || !list.length) return 'I have no record of any banned users.';

    list.forEach(member => {
        if (!member.reason) member.reason = 'No reason provided';
        reply += `${i.user.username}: ${reason}\n`;
    })

    return reply;
}