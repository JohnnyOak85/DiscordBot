module.exports = {
    name: 'strikes',
    description: "Lists all users with strikes. If provided with a user, it will list that user's strikes",
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
            const member = await commandHelper.getMember();
            const list = await commandHelper.getStrikesList();
            const reply = await buildReply(list, member);
            commandHelper.setReply(reply);
        }
        message.channel.send(commandHelper.getReply())
            .catch(err => { throw err; });
    }
}

async function buildReply(list, member) {
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