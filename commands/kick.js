const { verifyPermission, verifyMember } = require('../helpers/member.helper');
const { kick } = require('../helpers/ban.helper');


module.exports = {
    name: 'kick',
    description: 'Mention a user and that user gets removed from the server.',
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args) {
        try {
            if (await verifyPermission(message.member, 'BAN_MEMBERS', message.channel) && await verifyMember(message.member, message.mentions.members.first(), message.channel)) {
                await kick(message.members.first(), message.guild, args.slice(1).join(' '));
                return;
            }
        } catch (error) {
            throw error
        }
    }
}