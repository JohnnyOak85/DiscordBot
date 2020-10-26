const { ensureRole, giveRole, removeRole, sendReply } = require('./guild.helper');
const { ensureMember, findMember } = require('./member.helper');

const { MAX_STRIKES } = require(`../docs/config.json`);
const { getList, saveList } = require('./doc.helper');

// Private

function ensureReason(reason) {
    if (reason === '') {
        reason = 'No reason provided.';
    };

    return reason;
}

async function checkStrikes(member, list, reason) {
    try {
        const amount = list[member.user.id].strikes.length;

        if (amount === MAX_STRIKES) {
            list[member.id] = await ban(member, list, reason);
        } else if (amount >= (MAX_STRIKES / 2)) {
            list[member.id] = await mute(member, list);
        }

        return list[member.id];
    } catch (error) {
        throw error
    }
}

async function mute(member, list) {
    try {
        list[member.id] = ensureMember(list, member);

        const role = await ensureRole(member.guild, 'muted')

        list[member.id] = await giveRole(member, list, role)
        list[member.id].action = 'muted';

        return list[member.id];
    } catch (error) {
        throw error
    }
}

// Public

async function giveStrike(member, list, reason) {
    try {
        reason = ensureReason(reason);

        list[member.id] = ensureMember(list, member);
        list[member.id].strikes.push(reason);
        list[member.id].action = 'warned';
        list[member.id] = await checkStrikes(member, list, reason)

        return list[member.id];
    } catch (error) {
        throw error
    }
};

async function unmute(list, id, guild) {
    try {
        const role = ensureRole(guild, 'muted')
        const member = findMember(guild, id);

        if (member.roles.cache.has(role.id)) {
            list[id] = await removeRole(member, list, role)
            await sendReply(guild.systemChannel, `${list[id].username} has been unmuted.`);
        }

        return list[id];
    } catch (error) {
        throw error;
    }
}

async function kick(member, list, reason) {
    try {
        reason = ensureReason(reason);
        list[member.id] = ensureMember(list, member);

        await member.kick(reason)

        list[member.id].action = 'kicked';

        return list[member.id];
    } catch (error) {
        throw error
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

async function ban(member, list, reason) {
    try {
        reason = ensureReason(reason);
        list[member.id] = ensureMember(list, member);

        if (!list[member.id].strikes.includes(reason)) {
            list[member.id].strikes.push(reason);
        }

        await member.ban(reason)

        list[member.id].action = 'banned';
        list[member.id].banned = true;
        delete list[member.id].roles;

        return list[member.id];
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
            await sendReply(guild.systemChannel, `${banned.user.username} has been unbanned.`)
        }
        else {
            await sendReply(guild.systemChannel, `${memberRef} isn't banned.`)
        }

        list[banned.user.id] = ensureMember(list, banned.user);
        delete list[banned.user.id].banned;

        await saveList(guild.id, list);
    } catch (error) {
        throw error;
    }
}

async function listBans(guild) {
    try {
        const list = await guild.fetchBans()

        return list.array();
    } catch (error) {
        throw error
    }
}

module.exports = {
    giveStrike: giveStrike,
    unmute: unmute,
    kick: kick,
    findBanned: findBanned,
    ban: ban,
    unban: unban,
    listBans: listBans,
}