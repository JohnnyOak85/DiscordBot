const fs = module.require("fs-extra");
const moment = require('moment');
const { ROLES_LIST } = require(`../docs/config.json`);

let user;
let infractor;
let guild;
let reply;
let reason;

/**
 * @description Set up the arguments.
 * @param {*} message
 * @param {string} args
 */
function start(message, args) {
  user = message.member;
  infractor = message.mentions.members.first();
  guild = message.guild;
  reason = args.slice(1).join(' ');
  reply = '';
}

/**
 * @description Check if the user that issued the command has permissions.
 * @param {string} permission
 * @returns {boolean}
 */
function verifyUser(permission) {
  if (!user.hasPermission(permission)) {
    setReply('You do not have permission for this command!');
    return;
  }
  if (infractor && user.id === infractor.user.id) {
    setReply('You cannot moderate yourself!');
    return;
  }
  return true;
}

// Infractions Group

function getInfractor() {
  if (!infractor) {
    setReply('You need to mention a valid user!');
    return;
  }
  if (!infractor.manageable) {
    setReply('You cannot moderate this user.');
  }
  return infractor;
}

function setInfractor(user) {
  infractor = user;
}

async function unBan(infractor) {
  const list = await getList();
  await guild.members.unban(infractor.user.id).catch(error => { throw error });
  if (!list[infractor.id]) list[infractor.id] = { username: infractor.user.username };
  if (list[infractor.id].banned) list[infractor.id].banned = false;
  if (!list[infractor.id].strikes) {
    list[infractor.id].strikes = [];
    list[infractor.id].strikes.push('No reason provided.');
  }
}

async function removeStrike() {
  const list = await getList();
  if (!list[infractor.id] || !list[infractor.id].strikes || !list[infractor.id].strikes.length) {
    setReply('This user has no strikes.');
    return;
  }
  list[infractor.id].strikes.shift();
  setReply(`An infraction was removed from ${infractor.user.username}`);
  await saveList(list);
}

// Roles Group

async function ensureRole(roleName) {
  const role = ROLES_LIST[roleName];

  let guildRole = guild.roles.cache.find(mR => mR.name === role.name);

  if (!guildRole) {
    guildRole = await guild.roles.create({
      data: {
        name: role.name,
        permissions: role.activePermissions
      }
    }).catch(err => { throw err; })

    // Update channel permissions
    guild.channels.cache.forEach(async (channel) => {
      await channel.updateOverwrite(guildRole, role.inactivePermissions)
        .catch(err => { throw err; })
    });
  }
  return guildRole;
}

async function addRole(role) {
  const list = await getList();
  const roleName = role.name.toLowerCase();
  if (infractor.roles.cache.has(role.id)) {
    setReply(`${infractor.user.username} already has the ${roleName} role.`);
    return;
  }
  await infractor.roles.add(role).catch(err => { throw err; });
  if (!list[infractor.user.id]) list[infractor.user.id] = { username: infractor.user.username };
  list[infractor.id].roles.push(role.id);
  await saveList(list);
  setReply(`${infractor.user.username} now has the ${roleName} role.`);
}

async function removeRole(role) {
  const list = await getList();
  const roleName = role.name.toLowerCase();
  if (!infractor.roles.cache.has(role.id)) {
    setReply(`This user does not have the ${roleName} role.`);
    return;
  }
  await infractor.roles.remove(role).catch(err => { throw err; });

  const index = list[infractor.user.id].roles.indexOf(role.id);
  if (index > -1) {
    list[infractor.user.id].roles.splice(index, 1);
  }

  await saveList(list);
  setReply(`${infractor.user.username} is no longer ${roleName}`);
}

// Lists Group

async function getList() {
  const list = fs.readJsonSync(`./docs/guilds/guild_${guild.id}.json`);
  return list.members;
}

async function updateList() {
  const list = await getList();

  if (!list[infractor.id]) list[infractor.id] = { username: infractor.user.username };
  if (!list[infractor.id].strikes) list[infractor.id].strikes = [];

  let reason = getReason();
  if (reason === '' || reason === ' ') reason = 'No reason provided.'
  list[infractor.id].strikes.push(reason);
  return list;
};

async function saveList(members) {
  const list = fs.readJsonSync(`./docs/guilds/guild_${guild.id}.json`);
  list.members = members;
  fs.writeJsonSync(`./docs/guilds/guild_${guild.id}.json`, list);
}

async function fetchBans() {
  return guild.fetchBans()
    .then(banned => {
      if (!banned.array().length) {
        setReply(`I have no record of any banned users.`)
        return;
      };
      return banned;
    })
}

// Message Group

function setReply(message) {
  reply = message;
}

function getReply() {
  return reply;
}

function setReason(string) {
  reason = string;
}

function getReason() {
  if (!reason) reason = '';
  return reason;
}

// Utilities Group

function getNumber(num) {
  num = parseInt(num);
  if (!num || num < 1 || num > 100 || isNaN(num))
    return;
  return num;
}

async function startTimer(list, num, timeValue) {
  const time = this.getNumber(num);
  setReply(getReply().replace(num, ''));

  if (time) {
    list[infractor.id].timer = moment().add(time, timeValue).format();
    setReply(`${getReply()} for ${time} ${timeValue}`);
  }

  return list;
}

module.exports = {
  start: start,
  verifyUser: verifyUser,
  removeStrike: removeStrike,
  ensureRole: ensureRole,
  addRole: addRole,
  removeRole: removeRole,
  startTimer: startTimer,
  setReply: setReply,
  getReply: getReply,
  getNumber: getNumber,
  getInfractor: getInfractor,
  setInfractor: setInfractor,
  getReason: getReason,
  setReason: setReason,
  getList: getList,
  fetchBans: fetchBans,
  updateList: updateList,
  unBan: unBan,
  saveList: saveList
}