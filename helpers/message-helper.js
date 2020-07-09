const { BANNED_WORDS } = require('../docs/banned-words.json');
const { BANNED_SITES } = require('../docs/banned-sites.json');
let previousMessage = {};
let reply = ''

function isSafe(message) {
    if (message.member.hasPermission('MANAGE_MESSAGES')) return true;

    if (isMessageValid(message.content) || areMentionsValid(message.mentions.users) || isMessageDifferent(message)) return;

    message.delete();
    message.reply(reply);

    previousMessage.member = message.member.id;
    previousMessage.content = message.content;
    return true;
}

function isMessageValid(message) {
    if (BANNED_WORDS.some(str => message.toLowerCase().includes(str)) ||
        BANNED_SITES.some(str => message.toLowerCase().includes(str))) {
        reply = `wait, that's illegal!`;
        return false;
    };
}

function areMentionsValid(mentions) {
    if (mentions.array().length > 3) {
        reply = 'chill with the mention train!';
        return false;
    }
}

function isMessageDifferent(message) {
    if (!previousMessage.memberId || previousMessage.member != message.member.id) return true;

    if (previousMessage.content === message.content) {
        reply = 'stop repeating yourself!'
        return false;
    }
}
module.exports = {
    isSafe: isSafe
}