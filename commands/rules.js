module.exports = {
    name: 'rules',
    description: 'Displays the list of rules.',
    usage: ' ',
    execute(message, args, commandHelper) {
        const { rules } = require('../server-lists/config.json');
        message.channel.send(rules);
    }
}