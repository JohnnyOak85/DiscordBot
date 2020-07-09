module.exports = {
    name: 'strikes',
    description: "Lists all users with strikes. If provided with a user, it will list that user's strikes",
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const memberList = await commandHelper.getList();
            const warnedList = [];
            Object.entries(memberList).forEach(([id, member]) => {
                if (member.strikes && member.strikes.length) {
                    warnedList.push(member);
                }
            });

            const infractor = await commandHelper.getInfractor();
            let reply = 'I have no record of any warned users.';

            if (!warnedList.length) return;

            if (!infractor) {
                reply = '';
                Object.values(warnedList).forEach(member => {
                    reply += `${member.username}: ${member.strikes.length}\n`;
                })
                commandHelper.setReply(reply);
                return;
            }

            reply = 'This user has no previous strikes.';
            const member = memberList[infractor.id];
            if (member) {
                reply = '';
                reply += `${member.username}\n`;
                member.strikes.forEach(infraction => {
                    let reason = 'No reason provided';
                    if (infraction != '') reason = infraction;
                    reply += `- ${reason}\n`;
                })
            }

            commandHelper.setReply(reply);
        }
        message.channel.send(commandHelper.getReply());
    }
}