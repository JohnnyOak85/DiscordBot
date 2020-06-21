const { prefix } = require('../server-lists/config.json');
module.exports = {
    name: 'help',
    description: 'Displays the list of commands.',
    usage: '<command>',
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push('List of commands:');
            data.push(commands.map(command => command.name).join('\n'));
            data.push(`You can send \`${prefix}help [command name]\` to get info on a specific command!`);

            message.channel.send(data, { split: true });
            return;
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name);

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);
        data.push(`**Description:** ${command.description}`);
        data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);


        message.channel.send(data, { split: true });
    }
}