const fs = module.require('fs-extra');
const infractorDoc = './lists/warnings.json';
export const name = 'warn';
export const description = 'Gives an infraction to a user';
export function execute(message, args) {
    // Check if the user that issued the command has permissions
    if (!message.member.hasPermission('MANAGE_MESSAGES'))
        return message.reply('you do not have permission for this command!');

    // Get the infractor to apply the command to
    const infractor = message.mentions.members.first();
    if (!infractor || !infractor.manageable)
        return message.reply('you need to mention a valid user!');

    // Check if a list of infractors exists
    if (!fs.pathExistsSync(infractorDoc))
        fs.outputFileSync(infractorDoc, '{}');
    let infractorList = fs.readJsonSync(infractorDoc);

    // Check if the infractor is on the list
    if (!infractorList[infractor.id]) {
        infractorList[infractor.id] = {
            guild: message.guild.id,
            infractions: 0
        };
    }

    // Get the reason for the command if any was given
    let reason = args.slice(1).join(' ');
    if (!reason) reason = '';

    // Apply the command
    infractorList[infractor.id].infractions++;
    fs.writeJsonSync(infractorDoc, infractorList);
    const infractions = infractorList[infractor.id].infractions;
    message.channel.send(`${infractor.user.username} has been warned!\n${reason}\nInfractions: ${infractions}`);

    // Check if infractor is a repeated offender
    if (infractions > 4)
        return message.channel.send(`${infractor.user.username} has been banned! Reason: repeated offender!... But not really`);
    else if (infractions > 2)
        return message.channel.send(`${infractor.user.username} has been muted for 5 minutes!... But not really`);
}