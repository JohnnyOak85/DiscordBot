module.exports = {
    name: 'help',
    description: 'Displays the list of commands. It can also display information on a given command.',
    usage: '<command>',
    moderation: false,
    execute(message, args, commandHelper) {
        const { PREFIX } = require('../docs/config.json');
        const { commands } = message.client;
        const data = [];

        if (!args.length) {
            data.push('List of commands:');
            data.push(commands.map(command => {
                if (!message.member.hasPermission("MANAGE_MESSAGES") && command.moderation) return;
                else return ` * !${command.name}`;
            }).filter(x => x).join('\n'))

            data.push(`You can send \`${PREFIX}help [command name]\` to get info on a specific command!`);
            commandHelper.setReply(data);
        }
        else {
            const name = args[0].toLowerCase();
            const command = commands.get(name);
            if (!command) {
                commandHelper.setReply("That command doesn't exist");
                return;
            }
            data.push(`**Name:** ${command.name}`);
            data.push(`**Description:** ${command.description}`);
            data.push(`**Usage:** ${PREFIX}${command.name} ${command.usage}`);
            commandHelper.setReply(data);
        }

        message.channel.send(commandHelper.getReply());
    }
}
