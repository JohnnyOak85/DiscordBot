const { listBans } = require('../helpers/punishment.helper');
const { verifyPermission } = require('../helpers/member.helper');
const { sendReply } = require('../helpers/message.helper')

module.exports = {
    name: 'banned',
    description: 'Lists all the users that have been banned.',
    usage: ' ',
    moderation: true,
    async execute(message, args) {
        try {
            if (verifyPermission(message.member, 'BAN_MEMBERS', message.channel)) {
                const list = await listBans(message.guild);
                let reply = '';

                if (!list || !list.length) await sendReply(message.channel, 'I have no record of any banned users.');

                for (const member of list) {
                    if (!member.reason) member.reason = 'No reason provided';
                    reply += `${member.user.username}: ${reason}\n`;
                }

                await sendReply(message.channel, reply);
            }
        } catch (error) {
            throw error
        }
    }
}