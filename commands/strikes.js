const { start, verifyUser, getMember, getStrikesList, setReply, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'strikes',
    description: "Lists all users with strikes. If provided with a user, it will list that user's strikes",
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(message.member, 'MANAGE_MESSAGES')) {
                const member = getMember();
                const list = getStrikesList();
                setReply(buildReply(list, member));
            }

            await sendReply(message.channel, getReply());
        } catch (error) {
            throw error
        }
    }
}

function buildReply(list, member) {
    let reply = '';

    if (!list.length) return 'I have no record of any users with strikes.';

    if (!member) {
        Object.values(list).forEach(member => {
            reply += `${member.username}: ${member.strikes.length}\n`;
        })
        return reply;
    }

    if (!list[member.id] || !list[member.id].strikes) return 'This user has no previous strikes.';

    reply += `${list[member.id].username}\n`;

    list[member.id].strikes.forEach(strike => {
        if (strike === '') strike = 'No reason provided';
        reply += `- ${strike}\n`;
    });

    return reply;
}