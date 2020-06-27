const moment = require('moment');
const fs = module.require('fs-extra');

const { BANNED_WORDS } = require('../server-lists/banned-words.json');
const { BANNED_SITES } = require('../server-lists/banned-sites.json');

async function prune(guilds) {
    for (const guild of guilds.cache) {
        guild.members.prune({ days: 30 })
            .then(pruned => {
                const channel = guild.channels.cache.find(c => c.name === 'general');
                channel.send(`${pruned} users have been pruned due to inactivity!`);
            })
            .catch(err => { throw err });
    }
}

async function check(guilds, infraction) {
    const listUrl = `./user-lists/${infraction.toLowerCase()}.json`;
    const userList = await getList(listUrl);
    if (!userList || !Object.keys(userList).length) return;

    for (const index of Object.keys(userList)) {
        const user = userList[index];
        const guild = guilds.cache.get(user.guild);
        const infractor = guild.members.cache.get(user.id);
        if (!user.time) return;
        if (moment(user.time).isAfter(moment().format())) continue;
        await removeRole(infractor, guild, infraction).catch(err => { throw err });
        await updateList(listUrl, index).catch(err => { throw err });
        await reply(infractor, guild, infraction).catch(err => { throw err });
    }
}

async function getList(listUrl) {
    if (!fs.pathExistsSync(listUrl)) return;
    return fs.readJsonSync(listUrl);
}

async function removeRole(infractor, roleName) {
    const role = infractor.guild.roles.cache.find(r => r.name === roleName);
    if (role && infractor.roles.cache.has(role.id)) {
        await infractor.roles.remove(role)
            .catch(err => { throw err });
    }
}

async function updateList(listUrl, index) {
    const userList = await getList(listUrl);
    if (userList[index]) {
        delete userList[index];
        fs.writeJsonSync(listUrl, userList);
    }
}

async function reply(infractor, guild, infraction) {
    const channel = guild.channels.cache.find(c => c.name === 'general');
    channel.send(`${infractor.user.username} is no longer ${infraction.toLowerCase()}`);
}

async function logError(error, logger) {
    const now = moment().format();
    logger.log('error', `${error.message}: ${now}`);
    console.log(now);
    console.log(error);
}

function triage(member) {
    const guild = member.guild;
    const memberTag = `<@${member.user.id}>`;

    if (member.user.bot) {
        member.kick(`We have enough bots, thanks.`).catch(error => { throw error });
        return;
    }

    checkUsername(member)

    if (guild.systemChannel) {
        guild.systemChannel.send(`Welcome ${memberTag}! Check the rules by using the !rules command.`);
    }
}

function checkUsername(member) {
    if (BANNED_WORDS.some(str => member.nickname.toLowerCase().includes(str)) ||
        BANNED_SITES.some(str => member.nickname.toLowerCase().includes(str))) {
        member.setNickname('Class Clown')
    };
}

module.exports = {
    check: check,
    prune: prune,
    logError: logError,
    triage: triage,
    checkUsername: checkUsername
}