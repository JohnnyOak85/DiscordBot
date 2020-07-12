const helper = require('./task.helper.js');
const commandHelper = require('./command.helper.js');

const { PREFIX, TOKEN, PERMISSIONS, RULES } = require(`../docs/config.json`);
const { BANNED_WORDS } = require('../docs/banned-words.json');
const { BANNED_SITES } = require('../docs/banned-sites.json');

let reply = '';
let previousMessage = {};

// First run

function getToken() {
    return TOKEN;
}

async function buildCommands(commandList) {
    const commands = await helper.readDir('commands');
    commands.forEach(command => {
        const file = require(`../commands/${command}`);
        commandList.set(file.name, file);
    })
    // const commandFiles = fs.readdirSync('./commands');
    // for (const file of commandFiles) {
    //     const command = require(`./commands/${file}`);
    //     bot.commands.set(command.name, command);
    // }
}

async function promote(guilds, id) {
    guilds.forEach(guild => {
        const bot = guild.members.cache.find(u => u.user.id === id);
        helper.ensureRole(guild, 'bot')
            .then(role => {
                if (bot.roles.cache.has(role.id)) return;
                bot.roles.add(role)
            })
            .catch(err => { throw err; });
    })
}

async function buildDoc(guilds) {
    guilds.forEach(guild => {
        helper.ensureDoc(guild.id)
            .then(doc => {
                if (!doc.name || !doc.members) {
                    doc.name = guild.name;
                    buildMemberList(guild)
                        .then(members => {
                            doc.members = members;
                            helper.saveDoc(guild.id, doc);
                        })
                }
            })
            .catch(err => { throw err });

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

async function buildCategory(guilds) {
    guilds.forEach(guild => {
        if (guild.id != "698238439971094618") return;

        helper.ensureChannel(guild, 'information')
            .then(category => {
                category.setPosition(1);
                category.updateOverwrite(guild.roles.everyone, PERMISSIONS)
                    .then(category => {
                        helper.ensureChannel(guild, 'rules')
                            .then(channel => {
                                channel.setParent(category.id);
                                channel.overwritePermissions(category.permissionOverwrites);
                                channel.messages.fetch().then(message => {
                                    const reply = buildReply();
                                    if (message.content === reply) return;
                                    channel.send(`${reply}`);
                                })
                            });
                        helper.ensureChannel(guild, 'events')
                            .then(channel => {
                                channel.setParent(category.id);
                                channel.overwritePermissions(category.permissionOverwrites);
                                guild.setSystemChannel(channel)
                            });
                    });
            })
            .catch(err => { throw err; });
    })
}

// Timed Tasks

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

// Member Tasks

async function checkMember(member) {
    const list = helper.getList(member.guild.id);

    try {
        if (isBot(member)) return;
        if (isOldMember(member, list)) return;
        list[member.user.id] = await validateUsername(member, list, member.user.username);
    } catch { error => { throw error } }

    helper.saveList(guild.id, list);

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

    if (BANNED_WORDS.some(word => nickname.toLowerCase().includes(word)) ||
        BANNED_SITES.some(site => nickname.toLowerCase().includes(site))) {
        list[member.user.id] = await helper.giveStrike(member, list, `Had illegal nickname: ${nickname}`);
        nickname = 'Princess Twinkletoes';
        member.setNickname(nickname)
            .catch(error => { throw error });
    };

    list[member.user.id].nickname = nickname;

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
    list[member.user.id] = await checkRole(member, list);
    helper.saveList(guild.id, list);
}

async function checkRole(member, list) {
    if (!list[member.user.id]) {
        list[member.user.id] = {
            username: member.user.username,
            roles: []
        }
    }

    if (!member._roles.length) return list[member.user.id];

    list[member.user.id].roles = member._roles;
    return list[member.user.id];
}

function registerBanStatus(guild, member, banStatus) {
    const list = helper.getList(guild.id);
    list[member.id] = helper.ensureMember(list, member);
    list[member.id].banned = banStatus;
    helper.saveList(guild.id, list);
}

// Message Tasks

function buildReply() {
    reply = '```markdown\n';
    RULES.forEach(rule => {
        reply += `* ${rule}\n`;
    })
    reply += '```';
}

async function checkMessage(message) {
    if (message.channel.type === 'dm' || message.member.hasPermission('MANAGE_MESSAGES')) return;

    const list = helper.getList(message.guild.id);

    try {
        checkBannedWords(message, list);
        checkMentions(message, list);
        checkRepetition(message, list);
    } catch { error => { throw error } }
}

async function checkBannedWords(message, list) {
    if (BANNED_WORDS.some(str => message.content.toLowerCase().includes(str)) ||
        BANNED_SITES.some(str => message.content.toLowerCase().includes(str))) {
        try {
            purgeMessage(message, `wait, that's illegal!`);
            reply = `${message.author.user.username} has been warned for posting a message with illegal content.`;
            list[message.author.id] = await giveStrike(list, message.author, message.guild, 'Posted message with illegal content.');
            helper.saveList(guild.id, list);
        } catch { error => { throw error } }
    };
}

async function checkMentions(message, list) {
    if (message.mentions.users.array().length >= 3) {
        purgeMessage(message, 'chill with the mention train!')
            .catch(error => { throw error });
    }

    if (message.mentions.users.array().length >= 6) {
        reply = `${message.author.user.username} has been warned for trying to mention too many people.`;
        list[message.author.id] = await giveStrike(list, message.author, message.guild, 'Posted message with too many mentions.')
            .catch(error => { throw error });
        helper.saveList(message.guild.id, list);
    }
}

async function checkRepetition(message, list) {
    if (!previousMessage.member || previousMessage.member != message.member.id || previousMessage.content != message.content) return;

    previousMessage.member = message.member.id;
    previousMessage.content = message.content;
    if (!previousMessage.counter) previousMessage.counter = 1;

    previousMessage.counter += 1;
    purgeMessage(message, 'stop repeating yourself!')
        .catch(error => { throw error });

    if (previousMessage.counter >= 3) {
        reply = `${message.author.user.username} has been warned for repeating the same message too many times in a row.`;
        list[message.author.id] = await giveStrike(list, message.author, message.guild, 'Posted same message repeatedly.')
            .catch(error => { throw error });
        helper.saveList(message.guild.id, list);
    }
}

function purgeMessage(message, reply) {
    try {
        message.delete();
        message.reply(reply);
    } catch { error => { throw error } }
}

async function giveStrike(list, member, guild, reason) {
    list[member.id] = helper.ensureMember(list, member);

    try {
        list[member.id] = await helper.giveStrike(message.author, list, reason);
        guild.systemChannel.send(reply);
    } catch { error => { throw error } }
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

// Logger Tasks

async function logError(error, logger) {
    const now = await helper.getDate();
    logger.log('error', `${error.message}\nFile: ${error.fileName}\nLine: ${error.lineNumber}\nTime: ${now}`);
    console.log(now);
    console.log(error);
}

async function logInfo(logger) {
    const now = await helper.getDate();
    logger.log('info', `The bot went online at: ${now}`);
}

module.exports = {
    getToken: getToken,
    buildCommands: buildCommands,
    promote: promote,
    buildDoc: buildDoc,
    buildCategory: buildCategory,
    checkTimers: checkTimers,
    pruneUsers: pruneUsers,
    checkMember: checkMember,
    updateMember: updateMember,
    registerBanStatus: registerBanStatus,
    checkMessage: checkMessage,
    executeCommand: executeCommand,
    logError: logError,
    logInfo: logInfo,
}