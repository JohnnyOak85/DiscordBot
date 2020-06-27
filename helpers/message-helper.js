const { BANNED_WORDS } = require('../server-lists/banned-words.json');
const { BANNED_SITES } = require('../server-lists/banned-sites.json');
let previousMessage = {};

function isSafe(message) {

    if (message.member.hasPermission('MANAGE_MESSAGES')) return true;

    if (BANNED_WORDS.some(str => message.content.toLowerCase().includes(str)) ||
        BANNED_SITES.some(str => message.content.toLowerCase().includes(str))) {
        message.delete();
        message.reply(`wait, that's illegal.`);
        return false;
    };

    if (message.mentions.users.array().length > 3) {
        message.delete();
        message.reply('chill with the mention train!');
        return false;
    }

    if (previousMessage.memberId) {
        if (previousMessage.memberId === message.member.id && previousMessage.content === message.content) {
            message.delete();
            message.reply('stop repeating yourself!');
            return false;
        }
    }
    
    previousMessage.memberId = message.member.id;
    previousMessage.content = message.content;
    return true;
}

module.exports = {
    isSafe: isSafe
}