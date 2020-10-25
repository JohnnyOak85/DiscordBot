const { PREFIX, DAYS_TO_PRUNE } = require(`../docs/config.json`);

const { setup } = require('./command.helper');
const { buildCommands, promote, buildDoc, setGuild } = require('./login.helper');
const { ensureRole, removeRole, sendReply, ensureChannel } = require('./guild.helper');
const { getDate, timerExpired } = require('./time.helper');
const { logError, logInfo } = require('./log.helper');
const { unban, findBanned } = require('./punishment.helper');
const { getList, saveList } = require('./doc.helper');
const { ensureMember, findMember, isBot, isOldMember, validateUsername } = require('./member.helper');
const { isBanned, textRepeated, isShouting, purgeMessage } = require('./message.helper');

async function start(bot) {
    try {
        await buildCommands(bot.commands);
        await promote(bot.guilds.cache, bot.user.id);
        await buildDoc(bot.guilds.cache);
        await setGuild(bot.guilds.cache);
    } catch (error) {
        throw error;
    };

    logInfo(`The bot went online at: ${getDate()}`);
}

async function executeCommand(message, commands) {
    if (message.channel.type === 'dm' || !message.content.startsWith(PREFIX)) return;

    try {
        const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if (!commands.has(command)) {
            await message.reply('invalid command.');
            return;
        }

        await setup(message, args);
        await commands.get(command).execute(message, args)
    } catch (error) {
        message.reply('there was an error trying to execute that command!');
        throw error
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

// Punishment Tasks

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

async function registerBanStatus(guild, member, banStatus) {
    try {
        const list = await getList(guild.id);
        list[member.id] = ensureMember(list, member);
        list[member.id].banned = banStatus;
        await saveList(guild.id, list);
    } catch (error) {
        throw error;
    }
}

async function pruneUsers(guilds) {
    for (const guild of guilds) {
        const pruned = await guild[1].members.prune({ days: DAYS_TO_PRUNE });
        await sendReply(guild.systemChannel, `${pruned} users have been pruned due to inactivity!`);
    }
}

// Message Tasks

async function checkMessage(message) {
    try {
        if (message.author.bot || message.channel.type === 'dm' || message.member.hasPermission('MANAGE_MESSAGES')) return;

        if (message.mentions.users.size >= 3) {
            await purgeMessage(message, 'chill with the mention train!');
        }

        if (isBanned(message.content)) {
            await purgeMessage(message, `wait, that's illegal!`);
        }

        if (isShouting(message.content.replace(/[^\w]/g, ""))) {
            await purgeMessage(message, 'stop shouting please!');
        }

        if (textRepeated(message.content.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " "))) {
            await purgeMessage(message, 'stop repeating yourself!');
        }

        if (await messageRepeated(message.channel, message.author.id, message.content)) {
            await purgeMessage(message, 'we heard you the first time!')
        }

    } catch (error) {
        throw error;
    }

}

module.exports = {
    start: start,
    checkTimers: checkTimers,
    pruneUsers: pruneUsers,
    checkMember: checkMember,
    updateMember: updateMember,
    registerBanStatus: registerBanStatus,
    checkMessage: checkMessage,
    executeCommand: executeCommand,
    logError: logError,
}