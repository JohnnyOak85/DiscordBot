const fs = module.require('fs-extra');
const moment = require('moment');
const infractorDoc = './lists/muted.json';

module.exports = {
    async check(guilds) {
        // Check if the muted list exists
        if (!fs.pathExistsSync(infractorDoc)) return;
        // Check if the list is empty
        const infractorList = fs.readJsonSync(infractorDoc);
        if (!Object.keys(infractorList).length) return;

        const infractors = Object.keys(infractorList);
        for (const infractor of infractors) {
            // Build a user object from the list
            let user = infractorList[infractor];
            user.id = infractor;
            // Check if the the time hasn't expired yet
            if (moment(user.time).isAfter(moment().format())) continue;
            
            const guild = guilds.cache.get(user.guild);
            const guildMember = guild.members.cache.get(user.id);
            const mutedRole = guildMember.guild.roles.cache.find(role => role.name === 'Muted');
            const channel = guild.channels.cache.find(channel => channel.name === 'general');
            // Unmute the user
            guildMember.roles.remove(mutedRole);
            delete infractorList[infractor];
            fs.writeJsonSync(infractorDoc, infractorList);
            // Send a feedback message
            channel.send(`${guildMember.user.username} has been unmuted!`);
        };
    }
}