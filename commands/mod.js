const { execute } = require("./mute");

module.exports = {
    name: 'mod',
    description: 'Mention a user and that user will be awarded with the moderator role.',
    usage: '<user>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('ADMINISTRATOR')) {
            const user = await commandHelper.getInfractor();
            if (user) {
                const role = await commandHelper.ensureRole('moderator').catch(err => { throw err; });
                await commandHelper.addRole(role);

            }
        }
        message.channel.send(commandHelper.getReply());
    }
}