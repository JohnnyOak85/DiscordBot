const { ensureMember } = require('./member.helper');
const { getList, saveList } = require('./doc.helper');

const { DAYS_TO_PRUNE } = require(`../docs/config.json`);

async function kick(member, guild, reason) {
    try {
        const list = getList(guild);

        if (reason === '') {
            reason = 'No reason provided.';
        };

        list[member.id] = ensureMember(list, member);

        await member.kick(reason);
        await guild.systemChannel.send(`${member.user.username} has been kicked.\n${reason}`)
        await saveList(guild.id, list);
    } catch (error) {
        throw error
    }
}

async function ban(member, guild, reason, days) {
    try {
        const list = getList(guild.id);

        if (reason === '') {
            reason = 'No reason provided.';
        };

        reason = reason.replace(days, '');

        days = parseInt(days);

        if (days && days > 0 && days < 100 && !isNaN(days)) {
            list[member.id].timer = addTime(amount, 'days');
            reason = `${reason} for ${days} days`;
        }

        list[member.id] = ensureMember(list, member);
        list[member.id].strikes.push(reason);

        await member.ban(reason);
        await guild.systemChannel.send(`${member.user.username} has been banned.\n${reason}`)

        list[member.id].banned = true;
        delete list[member.id].roles;

        await saveList(guild.id, list);
    } catch (error) {
        throw error
    }
}

async function unban(memberRef, guild, channel) {
    try {
        const banned = await findBanned(memberRef, guild);
        const list = await getList(guild.id);

        if (banned) {
            await guild.members.unban(banned.user.id);
            await guild.systemChannel.send(`${banned.user.username} has been unbanned.`)
        }
        else {
            if (channel) await channel.send(`${memberRef} isn't banned.`);
            return;
        }

        list[banned.user.id] = ensureMember(list, banned.user);
        delete list[banned.user.id].banned;

        await saveList(guild.id, list);
    } catch (error) {
        throw error;
    }
}

async function findBanned(memberRef, guild) {
    try {
        const list = await listBans(guild);

        if (parseInt(memberRef) !== NaN) {
            return list.find(member => member.user.id == memberRef);
        }
        else {
            return list.find(member => member.user.username == memberRef);
        }
    } catch (error) {
        throw error;
    }
}

async function listBans(guild) {
    try {
        const list = await guild.fetchBans();

        return list.array();
    } catch (error) {
        throw error
    }
}

async function registerBan(guild, member, banStatus) {
    try {
        const list = await getList(guild.id);

        list[member.user.id] = ensureMember(list, member);
        list[member.user.id].banned = banStatus;

        await saveList(guild.id, list);
    } catch (error) {
        throw error;
    }
}

async function pruneUsers(guilds) {
    for (const guild of guilds) {
        const pruned = await guild[1].members.prune({ days: DAYS_TO_PRUNE });
        await guild.systemChannel.send(`${pruned} users have been pruned due to inactivity!`)
    }
}

module.exports = {
    kick: kick,
    ban: ban,
    unban: unban,
    findBanned: findBanned,
    listBans: listBans,
    registerBan: registerBan,
    pruneUsers: pruneUsers
}