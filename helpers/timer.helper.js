const { ensureRole, removeRole, sendReply } = require('./guild.helper');
const { timerExpired } = require('./clock.helper');
const { unban, findBanned } = require('./punishment.helper');
const { getList, saveList } = require('./doc.helper');
const { findMember } = require('./member.helper');

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

async function removeBan(list, id, guild) {
    try {
        const member = await findBanned(id, guild)

        if (member) {
            list[id] = await unban(member, list, guild)
            await sendReply(guild.systemChannel, `${list[id].username} has been unbanned.`);
        }

        delete list[id].banned;
        return list[id];
    } catch (error) {
        throw error;
    }
}

async function checkTimers(guilds) {
    for (const guild of guilds) {
        try {
            const list = await getList(guild[1].id);
            if (!Object.keys(list).length) return;

            for (const member of Object.keys(list)) {
                if (!list[member].timer || timerExpired(list[member].timer)) return;

                if (list[member].banned) {
                    list[member] = await removeBan(list, member, guild)
                }

                list[member] = await unmute(list, member, guild)

                await saveList(guild.id, list);
            };
        } catch (error) {
            throw error;
        }

    }
}

module.exports = {
    checkTimers: checkTimers
}