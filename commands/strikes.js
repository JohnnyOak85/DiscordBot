const { verifyPermission } = require('../helpers/member.helper');
const { getStrikes } = require('../helpers/warn.helper');

module.exports = {
    name: 'strikes',
    description: "Lists all users with strikes. If provided with a user, it will list that user's strikes",
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            if (await verifyPermission(message.member, 'MANAGE_MESSAGES', message.channel)) {
                const list = await getStrikes(message.guild);
                let member;
                let reply = '';

                if (message.members) {
                    member = message.members.first();
                }

                if (!list.length) {
                    await message.channel.send('There is no record of any users with strikes.');
                    return;
                }

                if (!member) {
                    for (const member of Object.values(list)) {
                        reply += `${member.username}: ${member.strikes.length}\n`;
                    }

                    await message.channel.send(reply);
                    return;
                }

                if (!list[member.id] || !list[member.id].strikes) {
                    await message.channel.send(`${member.user.username} has no previous strikes.`);
                    return;
                }

                reply += `${list[member.id].username}\n`;

                list[member.id].strikes.forEach(strike => {
                    if (strike === '') strike = 'No reason provided';
                    reply += `- ${strike}\n`;
                });

                await message.channel.send(reply);
                return;
            }
        } catch (error) {
            throw error
        }
    }
}