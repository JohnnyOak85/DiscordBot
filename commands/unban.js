const { verifyMember } = require('../helpers/member.helper');
const { unban } = require('../helpers/punishment.helper');

module.exports = {
    name: 'unban',
    description: `Provide a username and that user will have access to the server again.`,
    usage: '<username>',
    moderation: true,
    async execute(message, args) {
        try {
            if (verifyPermission(message.member, 'BAN_MEMBERS', message.channel) && verifyMember(message.member, args[0], message.channel)) {
                await unban(args[0], message.guild);
            }
        } catch (error) {
            throw error
        }
    }
}