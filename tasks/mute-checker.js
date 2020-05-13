import moment from 'moment';

const fs = module.require('fs-extra');
const infractorDoc = './lists/muted.json';

export async function check(guilds) {
    // Check if a list of infractors exists
    if (!fs.pathExistsSync(infractorDoc))
        return;

    // Check if the list is empty
    const infractorList = fs.readJsonSync(infractorDoc);
    if (!Object.keys(infractorList).length)
        return;

    // Loop through the list for each infractor
    const infractors = Object.keys(infractorList);
    for (const infractor of infractors) {
        // Build a user object from the list
        const user = infractorList[infractor];
        user.id = infractor;

        // Check if the time hasn't expired yet
        if (moment(user.time).isAfter(moment().format()))
            continue;

        // Get all the user information
        const guild = guilds.cache.get(user.guild);
        const guildMember = guild.members.cache.get(user.id);
        const mutedRole = guildMember.guild.roles.cache.find(role => role.name === 'Muted');
        const channel = guild.channels.cache.find(channel => channel.name === 'general');

        // Apply the command
        guildMember.roles.remove(mutedRole);
        delete infractorList[infractor];
        fs.writeJsonSync(infractorDoc, infractorList);
        channel.send(`${guildMember.user.username} has been unmuted!`);
    }
    ;
}