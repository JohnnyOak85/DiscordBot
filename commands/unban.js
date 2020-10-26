const { verifyPermission, verifyMember } = require('../helpers/member.helper');
const { unban } = require('../helpers/ban.helper');

module.exports = {
    name: 'unban',
    description: `Provide a username and that user will have access to the server again.`,
    usage: '<username>',
    moderation: true,
    async execute(message, args) {
        try {
            if (await verifyPermission(message.member, 'BAN_MEMBERS', message.channel) && await verifyMember(message.member, args[0], message.channel)) {
                await unban(args[0], message.guild, message.channel);
                return;
            }
        } catch (error) {
            throw error
        }
    }
}