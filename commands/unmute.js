const { verifyPermission, verifyMember } = require('../helpers/member.helper');
const { removeRole } = require('../helpers/guild.helper');

module.exports = {
    name: 'unmute',
    description: 'Mention a user and that user will no longer be muted.',
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            if (await verifyPermission(message.member, 'MANAGE_MESSAGES', message.channel) && await verifyMember(message.member, message.mentions.members.first(), message.channel)) {
                await removeRole(message.members.first(), message.guild, 'muted')
                return;
            }
        } catch (error) {
            throw error
        }
    }
}