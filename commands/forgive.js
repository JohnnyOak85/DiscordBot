const { verifyPermission, verifyMember } = require('../helpers/member.helper');
const { forgive } = require('../helpers/warn.helper');

module.exports = {
    name: 'forgive',
    description: 'Mention a user and that user will get a strike removed.',
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            if (verifyPermission(message.member, 'MANAGE_MESSAGES', message.channel) && verifyMember(message.member, message.mentions.members.first(), message.channel)) {
                await forgive(message.members.first(), message.guild, message.channel, args[0]);
                return;
            }
        } catch (error) {
            throw error
        }
    }
}