module.exports = {
    name: 'infractions',
    description: 'Lists all the infractions of a user.',
    usage: '<user>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const warnedList = await commandHelper.getList('warned');
            const infractor = await commandHelper.getInfractor();
            let reply = 'I have no record of any warned users.';

            if (infractor && warnedList) {
                reply = 'This user has no previous infractions';
                const member = warnedList[infractor.id];
                if (member && message.guild.id === member.guild) {
                    reply = '';
                    reply += `<@!${member.id}>\n`
                    member.infractions.forEach(infraction => {
                        let reason = 'No reason provided';
                        if (infraction != '') reason = infraction;
                        reply += `- ${reason}\n`
                    })
                }
                commandHelper.setReply(reply);
            }

            else if (warnedList) {
                reply = '';
                Object.values(warnedList).forEach(member => {
                    console.log(member.name);
                    if (message.guild.id === member.guild) {
                        console.log(`<@!${member.id}>`)
                        reply += `<@!${member.id}>\n`
                    }
                })
                commandHelper.setReply(reply);
            }
        }
        message.channel.send(commandHelper.getReply());
    }
}