const { PREFIX, DAYS_TO_PRUNE } = require(`../docs/config.json`);

const { setup } = require('./command.helper');
const { buildCommands, promote, buildDoc, setGuild } = require('./login.helper');
const { sendReply } = require('./guild.helper');
const { getDate } = require('./clock.helper');
const { logError, logInfo } = require('./log.helper');
const { getList, saveList } = require('./doc.helper');
const { ensureMember } = require('./member.helper');
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

// Punishment Tasks

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
    pruneUsers: pruneUsers,
    registerBanStatus: registerBanStatus,
    checkMessage: checkMessage,
    executeCommand: executeCommand,
    logError: logError,
}