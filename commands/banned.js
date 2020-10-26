const { listBans } = require('../helpers/ban.helper');
const { verifyPermission } = require('../helpers/member.helper');

module.exports = {
    name: 'banned',
    description: 'Lists all the users that have been banned.',
    usage: ' ',
    moderation: true,
    async execute(message, args) {
        try {
            if (await verifyPermission(message.member, 'BAN_MEMBERS', message.channel)) {
                const list = await listBans(message.guild);
                let reply = '';

                if (!list || !list.length) {
                    await message.channel.send('I have no record of any banned users.');
                    return;
                }

                for (const member of list) {
                    if (!member.reason) member.reason = 'No reason provided';
                    reply += `${member.user.username}: ${reason}\n`;
                }

                await message.channel.send(reply);
                return;
            }
        } catch (error) {
            throw error
        }
    }
}