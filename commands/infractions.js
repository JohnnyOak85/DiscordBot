const fs = module.require('fs-extra');
const infractorDoc = './lists/warnings.json';

module.exports = {
    name: 'charges',
    description: 'Returns how many infractions a user has',
    execute(message, args) {
        // Check if the user that issued the command has permissions
        if (!message.member.hasPermission('MANAGE_MESSAGES'))
            return message.reply('you do not have permission for this command!');

        // Check if there was a user mentioned and if the that user can be managed
        const infractor = message.mentions.members.first();
        if (!infractor || !infractor.manageable)
            return message.reply('you need to mention a valid user!');

        // Check if a list of infractors exists
        if (!fs.pathExistsSync(infractorDoc))
            fs.outputFileSync(infractorDoc, '{}');
        const infractorList = fs.readJsonSync(infractorDoc);

        // Check if the user has had any infractions issued before
        if (!infractorList[infractor.id])
            return message.reply('this member has no previous infractions!');

        // Apply the command
        fs.writeJsonSync(infractorDoc, infractorList);
        const infractions = infractorList[infractor.id].infractions;
        message.channel.send(`${infractor.user.username} has ${infractions} infractions!`);
    }
}