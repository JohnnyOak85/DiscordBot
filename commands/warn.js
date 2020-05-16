const fs = module.require('fs-extra');
const infractorDoc = './lists/warnings.json';

module.exports = {
    name: 'warn',
    description: 'Gives an infraction to a user',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);

        let infractor;
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) infractor = await commandHelper.getInfractor();

        if (infractor) {
            await commandHelper.addInfractor('warned');
            await commandHelper.setInfractions('warned', commandHelper.getReason());
        };

        message.channel.send(commandHelper.getReply());


        

        // // Apply the command
        // infractorList[infractor.id].infractions++;
        // fs.writeJsonSync(infractorDoc, infractorList);
        // const infractions = infractorList[infractor.id].infractions;
        // message.channel.send(`${infractor.user.username} has been warned!\n${reason}\nInfractions: ${infractions}`);

        // Check if infractor is a repeated offender
        // if (infractions > 4)
        //     return message.channel.send(`${infractor.user.username} has been banned! Reason: repeated offender!... But not really`);
        // else if (infractions > 2)
        //     return message.channel.send(`${infractor.user.username} has been muted for 5 minutes!... But not really`);
    }
}