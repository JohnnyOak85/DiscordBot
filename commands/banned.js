module.exports = {
    name: 'banned',
    description: 'Lists all the users that have been banned.',
    usage: ' ',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser(message.member, 'BAN_MEMBERS')) {
            const list = await commandHelper.getBansList()
                .catch(err => { throw err; });
            const reply = await buildReply(list);
            commandHelper.setReply(reply);
        }
        message.channel.send(commandHelper.getReply())
            .catch(err => { throw err; });
    }
}

async function buildReply(list) {
    let reply = '';

    if (!list || !list.length) return 'I have no record of any banned users.';

    list.forEach(member => {
        if (!member.reason) member.reason = 'No reason provided';
        reply += `${i.user.username}: ${reason}\n`;
    })

    return reply;
}