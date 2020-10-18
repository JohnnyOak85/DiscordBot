module.exports = {
    name: 'help',
    description: 'Displays the list of commands. It can also display information on a given command.',
    usage: '<command>',
    moderation: false,
    async execute(message, args, commandHelper) {
        try {
            const { commands } = message.client;
            const reply = buildReply(commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES'), commands, args);
            
            commandHelper.setReply(reply);
            await commandHelper.sendReply(message.guild, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}

function buildReply(isMod, commands, args) {
    const { PREFIX } = require('../docs/config.json');
    const data = [];

    if (!args.length) {
        data.push('List of commands:');
        data.push(commands.map(command => {
            if (!isMod && command.moderation) return;
            else return ` * !${command.name}`;
        }).filter(x => x).join('\n'))

        data.push(`You can send \`${PREFIX}help [command name]\` to get info on a specific command!`);
        return data;
    }

    const command = commands.get(args[0].toLowerCase());

    if (!command) {
        return `That command doesn't exist`
    }

    data.push(`**Name:** ${command.name}`);
    data.push(`**Description:** ${command.description}`);
    data.push(`**Usage:** ${PREFIX}${command.name} ${command.usage}`);

    return data;
}