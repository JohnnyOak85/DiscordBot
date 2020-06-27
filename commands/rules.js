module.exports = {
    name: 'rules',
    description: 'Displays the list of rules.',
    usage: ' ',
    execute(message, args, commandHelper) {
        const { RULES } = require('../server-lists/config.json');
        message.channel.send(RULES);
    }
}