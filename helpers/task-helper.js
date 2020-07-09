const moment = require('moment');
const fs = module.require('fs-extra');

const { BANNED_WORDS } = require('../docs/banned-words.json');
const { BANNED_SITES } = require('../docs/banned-sites.json');
const { ROLES_LIST } = require(`../docs/config.json`);
const { CHANNELS_LIST } = require(`../docs/config.json`);

// First run

async function promoteBot(guilds, botId) {
    guilds.forEach(guild => {
        ensureRole(guild, ROLES_LIST['bot'])
            .then(role => {
                const bot = guild.members.cache.find(u => u.user.id === botId);
                if (bot.roles.cache.has(role.id)) return;
                bot.roles.add(role)
            })
            .catch(err => { throw err; });
    })
}

async function ensureRole(guild, roleSchema) {
    let role = guild.roles.cache.find(r => r.name === roleSchema.name);

    if (!role) {
        role = await guild.roles.create({
            data: {
                name: roleSchema.name,
                permissions: roleSchema.activePermissions
            }
        })
            .catch(err => { throw err; });

        guild.channels.cache.forEach(async (channel) => {
            await channel.updateOverwrite(role, roleSchema.inactivePermissions)
                .catch(err => { throw err; })
        });
    }
    return role;
}

async function buildGuildDoc(guilds) {
    guilds.forEach(guild => {
        const path = `./docs/guilds/guild_${guild.id}.json`;
        if (!fs.pathExistsSync(path)) fs.outputFileSync(path, "{}");

        const guildDoc = fs.readJsonSync(path);
        if (!guildDoc.name) {
            guildDoc.name = guild.name;
            guildDoc.members = buildMemberList(guild)
                .catch(err => { throw err });
        }
        fs.writeJsonSync(path, guildDoc);
    })
}

async function buildMemberList(guild) {
    const members = {};
    guild.members.cache.forEach(member => {
        if (member._roles.length) {
            members[member.user.id] = {
                username: member.user.username,
                roles: member._roles
            }
        }
    })

    guild.fetchBans().then(res => {
        res.forEach(member => {
            if (member.reason === null) member.reason = 'No reason provided.';
            members[member.user.id] = {
                username: member.user.username,
                banned: true,
                strikes: [
                    member.reason
                ]
            }
        })
    })
        .catch(err => { throw err });
    return members;
}

async function ensureChannel(guilds) {
    //TODO Might not need this at all.
    const channelSchema = CHANNELS_LIST['rules'];

    guilds.forEach(guild => {
        if (guild.id != "698238439971094618") return;
        if (guild.channels.cache.some(c => c.name === 'Information')) return;

        //TODO Permissions aren't working properly.

        guild.channels.create('Information', {
            type: 'category',
            permissionsOverwrites: [{
                id: guild.id,
                type: 'role',
                deny: ['SEND_MESSAGES']
            }]
        })
            .then(category => {
                guild.channels.create('rules')
                    .then(channel => {
                        channel.setParent(category.id);
                        console.log(`Created new channel ${channel}`)
                    })
            })
            .catch(error => { throw error })
    })
}

// Timed events

async function pruneUsers(guilds) {
    guilds.forEach(guild => {
        guild.members.prune({ days: 30 })
            .then(pruned => {
                sendReply(guild, `${pruned} users have been pruned due to inactivity!`)
                    .catch(error => { throw error });
            })
            .catch(err => { throw err });
    })
}

async function checkTimers(guilds) {
    guilds.forEach(guild => {
        const path = `./docs/guilds/guild_${guild.id}.json`;
        const guildDoc = fs.readJsonSync(path);
        let list = guildDoc.members;

        if (!Object.keys(list).length) return;

        Object.entries(list).forEach(([id, member]) => {
            if (!member.timer) return;
            if (moment(member.timer).isAfter(moment().format())) return;

            guildDoc.members = unMute(guild, list, id)
                .catch(err => { throw err });
            guildDoc.members = unBan(guild, list, id)
                .catch(err => { throw err });

            fs.writeJsonSync(path, guildDoc);
        });
    })
}

async function unMute(guild, list, id) {
    const role = guild.roles.cache.find(r => r.name === 'Muted');
    const guildMember = guild.members.cache.find(m => m.user.id === id);

    if (role && guildMember.roles.cache.has(role.id)) {
        await guildMember.roles.remove(role)
            .catch(err => { throw err });

        const index = list[id].roles.indexOf(role.id);
        if (index > -1) {
            list[id].roles.splice(index, 1);
        }

        sendReply(guild, `${list[id].username} is no longer muted.`)
            .catch(error => { throw error });
    }
    return list;
};

async function unBan(guild, list, id) {
    guild.fetchBans().then(banned => {
        if (!banned.array().length) return;
        if (!banned.array().some(m => m.user.id === id)) return;

        guild.member.unban(id)
            .catch(error => { throw error });
        list[id].banned = false;

        sendReply(guild, `${member.username} has been unbanned.`)
            .catch(error => { throw error });
    })
    return list;
}

// Member integrity

function triage(member) {
    try {
        if (isBot(member)) return;
        checkUsername(member, member.user.username);
        if (isOldMember(member)) return;
    } catch { error => { throw error } }

    const channel = member.guild.channels.cache.find(c => c.name === 'rules');

    sendReply(member.guild, `Welcome <@${member.user.id}>! Check the <#${channel.id}>.`)
        .catch(error => { throw error });
}

function isBot(member) {
    if (!member.user.bot) return;
    member.kick(`We have enough bots, thanks.`).catch(error => { throw error });
    return true;
}

async function isOldMember(member) {
    const path = `./docs/guilds/guild_${member.guild.id}.json`;
    const guildDoc = fs.readJsonSync(path);

    if (!guildDoc.members[member.user.id] || !guildDoc.members[member.user.id].roles) return

    guildDoc.members[member.user.id].roles.forEach(role => {
        const oldRole = member.guild.roles.cache.find(r => r.id === role);
        member.roles.add(oldRole)
            .catch(err => { throw err; });
    })

    sendReply(member.guild, `Welcome back <@${member.user.id}>!`)
        .catch(error => { throw error });

    return true;
}

async function checkUsername(member, nickname) {
    if (!member.manageable || !nickname) return;
    if (BANNED_WORDS.some(word => nickname.toLowerCase().includes(word)) ||
        BANNED_SITES.some(site => nickname.toLowerCase().includes(site))) {
        await updateList(member, `Had banned nickname: ${nickname}`);
        member.setNickname('Princess Twinkletoes')
            .catch(error => { throw error });
    };
}

async function checkRole(member) {
    const path = `./docs/guilds/guild_${member.guild.id}.json`;
    const guildDoc = fs.readJsonSync(path);

    if (!guildDoc.members[member.user.id] && member._roles.length) {
        guildDoc.members[member.user.id] = {
            username: member.user.username,
            roles: member._roles
        }
        fs.writeJsonSync(path, guildDoc);
        return;
    }

    if (!guildDoc.members[member.user.id].roles || member._roles.length != guildDoc.members[member.user.id].roles.length) {
        guildDoc.members[member.user.id].roles = member._roles;
        fs.writeJsonSync(path, guildDoc);
    }

}

// Lists

async function updateList(member, reason) {
    const path = `./docs/guilds/guild_${member.guild.id}.json`;
    const guildDoc = fs.readJsonSync(path);

    if (!guildDoc.members[member.user.id]) {
        guildDoc.members[member.user.id] = {
            username: member.user.username
        };
    }
    if (!guildDoc.members[member.user.id].strikes) {
        guildDoc.members[member.user.id].strikes = [];
    }
    guildDoc.members[member.user.id].strikes.push(reason);

    fs.writeJsonSync(path, guildDoc);
}

// Tasks

async function sendReply(guild, reply) {
    guild.systemChannel.send(reply)
        .catch(error => { throw error });
}

async function logError(error, logger) {
    const now = moment().format();
    logger.log('error', `${error.message}. ${now}`);
    console.log(now);
    console.log(error);
}

module.exports = {
    checkTimers: checkTimers,
    pruneUsers: pruneUsers,
    logError: logError,
    triage: triage,
    checkUsername: checkUsername,
    promoteBot: promoteBot,
    buildGuildDoc: buildGuildDoc,
    ensureChannel: ensureChannel,
    checkRole: checkRole
}