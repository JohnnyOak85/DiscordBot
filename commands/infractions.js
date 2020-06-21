module.exports = {
    name: 'infractions',
    description: 'Lists all the infractions of a user.',
    usage: '<user>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);

        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const warnedList = await commandHelper.getList('warned');
            let message = `I have no record of any warned users.`;
            if (warnedList) {
                message = '';
                Object.values(warnedList).forEach(member => {
                    message += `<@!${member.id}>\n`
                    if (member.infractions) {
                        member.infractions.forEach(infraction => {
                            let reason = 'No reason provided';
                            if (infraction != '') reason = infraction;
                            message += `- ${reason}\n`
                        })
                    }
                })
                commandHelper.setReply(message);
            }
        }
        message.channel.send(commandHelper.getReply());
    }
}