const { PREFIX } = require(`../docs/config.json`);
const { BANNED_WORDS } = require('../docs/banned-words.json');
const { BANNED_SITES } = require('../docs/banned-sites.json');

let helper;
let commandHelper;
let loginHelper;

let reply = '';
let previousMessage = {};

function start(bot) {
    setHelpers();

    try {
        loginHelper.buildCommands(bot.commands);
        loginHelper.promote(bot.guilds.cache, bot.user.id);
        loginHelper.buildDoc(bot.guilds.cache);
        loginHelper.buildCategory(bot.guilds.cache);
    } catch { error => { throw error } }

    helper.logger.log('info', `The bot went online at: ${helper.getDate()}`);
}

function setHelpers() {
    helper = require('./task.helper.js');
    commandHelper = require('./command.helper.js');
    loginHelper = require('./login.helper.js');
    commandHelper.setHelper(helper);
    loginHelper.setHelper(helper);
}

async function executeCommand(message, commands) {
    if (message.channel.type === 'dm' || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!commands.has(command)) {
        message.reply('invalid command.');
        return;
    }

    commands.get(command).execute(message, args, commandHelper)
        .catch(error => {
            message.reply('there was an error trying to execute that command!');
            throw error
        });
}

// Time Tasks

async function checkTimers(guilds) {
    guilds.forEach(guild => {
        const list = helper.getList(guild.id);
        if (!Object.keys(list).length) return;

        Object.keys(list).forEach((member) => {
            if (!list[member].timer || helper.timerExpired(list[member].timer)) return;

            if (list[member].banned) {
                list[member] = unban(list, member, guild)
                    .catch(err => { throw err });
            }

            list[member] = unmute(list, member, guild)
                .catch(err => { throw err });

            helper.saveList(guild.id, list);

            guild.systemChannel.send(reply)
                .catch(error => { throw error });
        });
    })
}

// Member Tasks

async function checkMember(member) {
    const list = helper.getList(member.guild.id);

    try {
        if (isBot(member)) return;
        if (isOldMember(member, list)) return;
        list[member.user.id] = await validateUsername(member, list, member.user.username);
    } catch { error => { throw error } }

    if (list[member.user.id]) {
        helper.saveList(guild.id, list);
    }

    const channel = member.guild.channels.cache.find(c => c.name === 'rules');
    member.guild.systemChannel.send(`Welcome <@${member.user.id}>! Check the ${channel.toString()}.`)
        .catch(error => { throw error });
}

function isBot(member) {
    if (!member.user.bot) return;
    member.kick()
        .catch(error => { throw error });
    return true;
}

async function validateUsername(member, list, nickname) {
    if (!member.manageable || !nickname) return;

    const censorNickname = 'Princess Twinkletoes';

    if (BANNED_WORDS.some(word => nickname.toLowerCase().includes(word)) ||
        BANNED_SITES.some(site => nickname.toLowerCase().includes(site))) {
        member.setNickname(censorNickname)
            .catch(error => { throw error });
    };

    if (!member.nickname || !list[member.user.id]) return;
    list[member.user.id] = helper.ensureMember(list, member);

    return list[member.user.id];
}

async function isOldMember(member, list) {
    if (!list[member.user.id] || !list[member.user.id].roles) return

    list[member.user.id].roles.forEach(role => {
        const oldRole = member.guild.roles.cache.find(r => r.id === role);

        member.roles.add(oldRole)
            .catch(err => { throw err; });
    })

    member.setNickname(list[member.user.id].nickname)
        .catch(error => { throw error });

    member.guild.systemChannel.send(`Welcome back <@${member.user.id}>!`)
        .catch(error => { throw error });

    return true;
}

async function updateMember(member) {
    const list = await helper.getList(member.guild.id);

    list[member.user.id] = await validateUsername(member, list, member.nickname)
        .catch(error => { throw error });

    if (member._roles.length) {
        list[member.user.id] = helper.ensureMember(list, member);
    }

    if (!list[member.user.id]) return;

    helper.saveList(member.guild.id, list);
}

// Punishment Tasks

async function unmute(list, id, guild) {
    const role = helper.ensureRole(guild, 'muted')
        .catch(err => { throw err });
    const member = guild.members.cache.find(m => m.user.id === memberId);

    if (member.roles.cache.has(role.id)) {
        list[id] = await helper.removeRole(member, list, role)
            .catch(err => { throw err })
    }

    reply = `${list[id].username} has been unmuted.`;

    return list[id];
}

async function unban(list, id, guild) {
    const banned = await helper.listBans(guild)
        .catch(err => { throw err });
    const member = banned.find(m => m.user.id === id);

    if (member) {
        list[id] = await helper.unban(member, list, guild)
            .catch(err => { throw err });
    }

    reply = `${list[id].username} has been unbanned.`;

    return list[id];
}

function registerBanStatus(guild, member, banStatus) {
    const list = helper.getList(guild.id);
    list[member.id] = helper.ensureMember(list, member);
    list[member.id].banned = banStatus;
    helper.saveList(guild.id, list);
}

async function pruneUsers(guilds) {
    guilds.forEach(guild => {
        guild.members.prune({ days: 30 })
            .then(pruned => {
                guild.systemChannel.send(`${pruned} users have been pruned due to inactivity!`)
                    .catch(error => { throw error });
            })
            .catch(err => { throw err });
    })
}

// Message Tasks

async function checkMessage(message) {
    if (message.channel.type === 'dm' || message.member.hasPermission('MANAGE_MESSAGES')) return;

    try {
        checkBannedWords(message);
        checkMentions(message);
        checkMessageRepetition(message);
        checkContentRepetition(message);
        checkUpperCase(message);
    } catch { error => { throw error } }

    previousMessage.member = message.member.id;
    previousMessage.content = message.content;

}

async function checkBannedWords(message) {
    if (BANNED_WORDS.some(str => message.content.toLowerCase().includes(str)) ||
        BANNED_SITES.some(str => message.content.toLowerCase().includes(str))) {
        try {
            purgeMessage(message, `wait, that's illegal!`);
        } catch { error => { throw error } }
    };
}

async function checkMentions(message) {
    console.log('mention check', message.mentions.users.array())
    if (message.mentions.users.array().length >= 3) {
        purgeMessage(message, 'chill with the mention train!')
            .catch(error => { throw error });
    }
}

async function checkMessageRepetition(message) {
    if (!previousMessage.member || previousMessage.member != message.member.id || previousMessage.content != message.content) return;

    if (!previousMessage.counter) previousMessage.counter = 1;

    previousMessage.counter += 1;
    purgeMessage(message, 'we heard you the first time!')
        .catch(error => { throw error });
}

async function checkContentRepetition(message) {
    const words = message.content.split(' ');
    let counter = 0;

    words.forEach(word => {
        for (i = 0; i < words.length; i++) {
            if (word.length < 3 || words[i] != word) continue;
            counter++;
            return
        }
    })

    if (counter < 5) return;

    purgeMessage(message, 'stop repeating yourself!')
        .catch(error => { throw error });
}

async function checkUpperCase(message) {
    let content = message.content.replace(/[^\w]/g, '');
    if (content.length < 60) return;
    let counter = 0;
    for (i = 0; i < content.length; i++) {
        if (content.charAt(i) === content.charAt(i).toUpperCase()) {
            counter += 1
        }
    }
    if (counter >= 60) {
        purgeMessage(message, 'stop shouting please!')
            .catch(error => { throw error });
    }
}

async function purgeMessage(message, reply) {
    try {
        message.delete();
        message.reply(reply);
    } catch { error => { throw error } }
}

// Logger Tasks

async function logError(error) {
    const now = await helper.getDate();
    helper.logger.log('error', `${error.message}\nFile: ${error.fileName}\nLine: ${error.lineNumber}\nTime: ${now}`);
    console.log(now);
    console.log(error);
}

module.exports = {
    start: start,
    setHelpers: setHelpers,
    checkTimers: checkTimers,
    pruneUsers: pruneUsers,
    checkMember: checkMember,
    updateMember: updateMember,
    registerBanStatus: registerBanStatus,
    checkMessage: checkMessage,
    executeCommand: executeCommand,
    logError: logError,
}