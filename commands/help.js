const { verifyPermission } = require('../helpers/member.helper');
const { PREFIX } = require('../docs/config.json');

module.exports = {
    name: 'help',
    description: 'Displays the list of commands. It can also display information on a given command.',
    usage: '<command>',
    moderation: false,
    async execute(message, args) {
        try {
            const { commands } = message.client;
            const verified = await verifyPermission(message.member, 'MANAGE_MESSAGES');
            const data = [];

            if (!args.length) {
                data.push('List of commands:');
                data.push(commands.map(command => {
                    if (!verified && command.moderation) return;
                    else return ` * !${command.name}`;
                }).filter(x => x).join('\n'))

                data.push(`You can send \`${PREFIX}help [command name]\` to get info on a specific command!`);

                await message.channel.send(data);
                return;
            }

            const command = commands.get(args[0].toLowerCase());

            if (!command) {
                await message.channel.send(`That command doesn't exist`);
                return;
            }

            data.push(`**Name:** ${command.name}`);
            data.push(`**Description:** ${command.description}`);
            data.push(`**Usage:** ${PREFIX}${command.name} ${command.usage}`);

            await message.channel.send(data);
            return;
        } catch (error) {
            throw error
        }
    }
}