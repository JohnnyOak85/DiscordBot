const fs = module.require('fs-extra');
const infractorDoc = './lists/muted.json';

export const name = 'unmute';
export const description = 'Unmute a member';
export async function execute(message, args) {
    // Check if the user that issued the command has permissions
    if (!message.member.hasPermission('MANAGE_MESSAGES'))
        return message.reply('you do not have permission for this command!');

    // Get the infractor to apply the command to
    const infractor = message.mentions.members.first();
    if (!infractor || !infractor.manageable)
        return message.reply('you need to mention a valid user!');

    // Check if the muted role exists
    const mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!mutedRole || !infractor.roles.cache.has(mutedRole.id))
        return message.channel.send('This user is not muted!');

    // Check if a list of infractors exists
    if (!fs.pathExistsSync(infractorDoc))
        return message.channel.send('I have no record of muted users');

    // Check if the infractor is on the list
    const infractorList = fs.readJsonSync(infractorDoc);
    if (!infractorList[infractor.id])
        return message.channel.send('This user is not muted!');

    // Apply the command
    await infractor.roles.remove(mutedRole);
    delete infractorList[infractor.id];
    fs.writeJsonSync(infractorDoc, infractorList);
    message.channel.send(`${infractor.user.username} has been unmuted!`);
}