module.exports = {
    name: 'infractions',
    description: 'Returns how many infractions a user has',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);

        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const warnedList = await commandHelper.getList('warned');
            let message = `I have no record of any warned users.`;
            if (warnedList) {
                message = '';
                console.log(warnedList)
                Object.values(warnedList).forEach(i => {
                    console.log(i);
                    let reason = 'No reason provided';
                    if (i.infractions) reason = i.infractions;
                    message += `<@!${i.id}> ${reason}\n`
                })
                commandHelper.setReply(message);
            }
        }

        message.channel.send(commandHelper.getReply());
    }
}