const fs = module.require('fs-extra');
const infractorDoc = './lists/warnings.json';
module.exports = {
    name: 'warn',
    description: 'Gives an infraction to a user',
    execute(message, args) {

        // Check if the user that issued the command has permissions
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have permission for this command!');
        // Check if there was a user mentioned and if the that user can be managed
        const infractor = message.mentions.members.first();
        if (!infractor || !infractor.manageable) return message.reply('you need to mention a valid user!');
        // Check if there were any previous infractors
        if (!fs.pathExistsSync(infractorDoc)) fs.outputFileSync(infractorDoc, '{}');
        let infractorList = fs.readJsonSync(infractorDoc);
        // Check if the user has had any infractions issued before
        if (!infractorList[infractor.id]) {
            infractorList[infractor.id] = {
                guild: message.guild.id,
                infractions: 0
            };
        }

        infractorList[infractor.id].infractions++

        // Write the infractors list back into the file
        fs.writeJsonSync(infractorDoc, infractorList);

        // Check if a reason was provided
        let reason = `Reason: ${args.slice(1).join(' ')}`;
        if (!reason) reason = 'None provided';

        const infractions = infractorList[infractor.id].infractions;
        // Send a feedback message
        if (infractions > 4) return message.channel.send(`${infractor.user.username} has been banned! Reason: repeated offender!... But not really`);
        else if (infractions > 2) return message.channel.send(`${infractor.user.username} has been muted for 5 minutes!... But not really`);
        message.channel.send(`${infractor.user.username} has been warned!\n${reason}\nInfractions: ${infractions}`);
    }
}