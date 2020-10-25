const { getList, saveList } = require('./doc.helper');
const { sendReply, ensureChannel } = require('./guild.helper');

const { BANNED_WORDS } = require('../docs/banned-words.json');
const { BANNED_SITES } = require('../docs/banned-sites.json');
const { CENSOR_NICKNAME } = require(`../docs/config.json`);

function ensureMember(list, member) {
    if (!list[member.id]) {
        list[member.id] = { username: member.user.username || member.username };
    };

    if (!list[member.id].strikes) {
        list[member.id].strikes = [];
    };

    if (member._roles) {
        list[member.id].roles = member._roles;
    }

    if (member.nickname) {
        list[member.id].nickname = member.nickname;
    }

    return list[member.id]
}

async function findMember(guild, id) {
    return guild.members.cache.find(member => member.user.id === id);
}

async function isBot(member) {
    try {
        if (!member.user.bot) return;

        await member.kick();

        return true;
    } catch (error) {
        throw error;
    }
}

async function isOldMember(member, list) {
    try {
        if (!list[member.user.id] || !list[member.user.id].roles) return

        for (const role of list[member.user.id].roles) {
            const oldRole = member.guild.roles.cache.find(r => r.id === role);

            await member.roles.add(oldRole)
        }

        await member.setNickname(list[member.user.id].nickname)

        return true;
    } catch (error) {
        throw error;
    }
}

async function validateUsername(member, list, nickname) {
    try {
        if (!member.manageable || !nickname) return;

        if (BANNED_WORDS.some(word => nickname.toLowerCase().includes(word)) ||
            BANNED_SITES.some(site => nickname.toLowerCase().includes(site))) {
            await member.setNickname(CENSOR_NICKNAME)
        };

        if (!member.nickname || !list[member.user.id]) return

        list[member.user.id] = ensureMember(list, member);

        return list[member.user.id];
    } catch (error) {
        throw error;
    }
}

async function checkMember(member) {
    try {
        const list = await getList(member.guild.id);

        if (await isBot(member)) return;
        if (isOldMember(member, list)) {
            await sendReply(member.guild.systemChannel, `Welcome back <@${member.user.id}>!`);
            return;
        };

        list[member.user.id] = await validateUsername(member, list, member.user.username);

        if (list[member.user.id]) {
            await saveList(guild.id, list);
        }

        const rules = await ensureChannel(member.guild, 'rules');

        await sendReply(member.guild.systemChannel, `Welcome <@${member.user.id}>! Check the ${rules.toString()}.`);
    } catch (error) {
        throw error
    }
}

async function updateMember(member) {
    try {
        const list = await getList(member.guild.id);

        list[member.user.id] = await validateUsername(member, list, member.nickname)

        if (member._roles.length) {
            list[member.user.id] = ensureMember(list, member);
        }

        if (!list[member.user.id]) return;

        await saveList(member.guild.id, list);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    checkMember: checkMember,
    updateMember: updateMember,
    ensureMember: ensureMember,
    findMember: findMember,
}