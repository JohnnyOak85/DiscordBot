const { verifyPermission, verifyMember } = require('../helpers/member.helper');
const { warn } = require('../helpers/warn.helper');

const { MAX_STRIKES } = require('../docs/config.json');

module.exports = {
    name: 'warn',
    description: `Mention a user and give it a strike. User will be muted after ${(MAX_STRIKES / 2)} strikes and banned after ${MAX_STRIKES}.`,
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args) {
        try {
            if (await verifyPermission(message.member, 'MANAGE_MESSAGES', message.channel) && await verifyMember(message.member, message.mentions.members.first(), message.channel)) {
                await warn(message.members.first(), message.guild, args.slice(1).join(' '));
                return;
            }
        } catch (error) {
            throw error
        }
    }
}