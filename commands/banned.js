const { start, verifyUser, listBans, setReply, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'banned',
    description: 'Lists all the users that have been banned.',
    usage: ' ',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);
            if (verifyUser(message.member, 'BAN_MEMBERS')) {
                const list = await listBans()
                setReply(buildReply(list));
            }
            await sendReply(message.channel, getReply());
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