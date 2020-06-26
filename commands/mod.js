const { execute } = require("./mute");

module.exports = {
    name: 'mod',
    description: 'Give the moderator role to a user.',
    usage: '<user>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('ADMINISTRATOR')) {
            const user = await commandHelper.getInfractor();
            if (user) {
                const role = await commandHelper.ensureRole('moderator').catch(err => { throw err; });
                await commandHelper.addRole(role)
            }
        }
        message.channel.send(commandHelper.getReply());
    }
}