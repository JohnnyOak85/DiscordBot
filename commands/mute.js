const { verifyPermission, verifyMember } = require('../helpers/member.helper');
const { giveRole } = require('../helpers/guild.helper');

module.exports = {
    name: 'mute',
    description: `Mention a user and that user won't be able to send messages. Can be temporary if provided with a number between 1 and 100.`,
    usage: '<user> <number of minutes> <reason>',
    moderation: true,
    async execute(message, args) {
        try {
            if (await verifyPermission(message.member, 'MANAGE_MESSAGES', message.channel) && await verifyMember(message.member, message.mentions.members.first(), message.channel)) {
                await giveRole(message.members.first(), message.guild, 'muted', args.slice(1).join(' '), args[0])
                return;
            }
        } catch (error) {
            throw error
        }
    }
}