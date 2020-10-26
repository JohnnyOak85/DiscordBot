const { sendReply } = require('./guild.helper');
const { ensureMember } = require('./member.helper');
const { getList, saveList } = require('./doc.helper');

async function kick(member, guild, reason) {
    try {
        const list = getList(guild);

        if (reason === '') {
            reason = 'No reason provided.';
        };

        list[member.id] = ensureMember(list, member);

        await member.kick(reason);
        await sendReply(guild.systemChannel, `${member.user.username} has been kicked.\n${reason}`);

        await saveList(guild.id, list);
    } catch (error) {
        throw error
    }
}

async function ban(member, guild, reason, days) {
    try {
        const list = getList(guild);

        if (reason === '') {
            reason = 'No reason provided.';
        };

        reason = reason.replace(days, '');

        days = parseInt(days);

        if (days && days >= 1 && days < 100 && !isNaN(days)) {
            list[member.id].timer = addTime(amount, type);
            reason = `${reason} for ${days} days`;
        }

        list[member.id] = ensureMember(list, member);
        list[member.id].strikes.push(reason);

        await member.ban(reason);
        await sendReply(guild.systemChannel, `${member.user.username} has been banned.\n${reason}`);

        list[member.id].banned = true;
        delete list[member.id].roles;

        await saveList(guild.id, list);
    } catch (error) {
        throw error
    }
}

async function unban(memberRef, guild) {
    try {
        const banned = await findBanned(memberRef, guild);
        const list = await getList(guild);

        if (banned) {
            await guild.members.unban(banned.user.id);
            await sendReply(guild.systemChannel, `${banned.user.username} has been unbanned.`);
        }
        else {
            await sendReply(guild.systemChannel, `${memberRef} isn't banned.`);
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

module.exports = {
    kick: kick,
    ban: ban,
    unban: unban,
    findBanned: findBanned,
    listBans: listBans,
}