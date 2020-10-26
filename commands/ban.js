const { verifyPermission, verifyMember } = require('../helpers/member.helper');
const { ban } = require('../helpers/ban.helper');

module.exports = {
    name: 'ban',
    description: 'Mention a user and that user will be banned from the server. Can be temporary if provided with a number between 1 and 100.',
    usage: '<user> <number of days> <reason>',
    moderation: true,
    async execute(message, args) {
        try {
            if (await verifyPermission(message.member, 'BAN_MEMBERS', message.channel) && await verifyMember(message.member, message.mentions.members.first(), message.channel)) {
                await ban(message.members.first(), message.guild, args.slice(1).join(' '), args[0]);
                return;
            }
        } catch (error) {
            throw error
        }
    }
}