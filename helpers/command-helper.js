const fs = module.require("fs-extra");
const moment = require('moment');
const ROLES_LIST = `./server-lists/roles.json`;

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
    reply = 'You do not have permission for this command!';
    return;
  }
  if (infractor && user.id === infractor.user.id) {
    reply = 'You cannot moderate yourself!';
    return;
  }
  return true;
}

// Infractions Group
function getInfractor() {
  if (!infractor || !infractor.manageable) {
    reply = 'You need to mention a valid user!';
    return;
  }
  return infractor;
}

function setInfractor(user) {
  infractor = user;
}

async function addInfractor(listName) {
  const list = await this.getList(listName);
  if (!list[infractor.id]) {
    list[infractor.id] = {
      id: infractor.user.id,
      name: infractor.user.username,
      guild: guild.id,
      reason: this.getReason()
    };
    await updateList(listName, list);
  }
  reply = `${infractor.user.username} has been ${listName} ${this.getReason()}`;
}

async function removeInfractor(listName) {
  const list = await this.getList(listName);
  if (!list[infractor.id]) return;
  delete list[infractor.id];
  await updateList(listName, list);
  reply = `${infractor.user.username} is no longer ${listName}`;
}

async function addInfraction(listName, infraction) {
  const list = await this.getList(listName);
  if (!list[infractor.id] || !list[infractor.id].infractions) {
    list[infractor.id].infractions = [];
  }
  list[infractor.user.id].infractions.push(infraction);
  delete list[infractor.user.id].reason;
  await updateList(listName, list);
}

async function removeInfraction(listName) {
  const list = await this.getList(listName);
  if (!list[infractor.id] && !list[infractor.id].infractions) {
    reply = 'This user has no previous infractions.';
    return;
  }
  list[infractor.id].infractions.shift();
  await updateList(listName, list);
  reply = `An infraction was removed from ${infractor.user.username}`;
}

async function startTimer(listName, num, timeValue) {
  const list = await this.getList(listName);
  const time = this.getNumber(num);
  reply = reply.replace(num, '');
  if (time) {
    list[infractor.id].time = moment().add(time, timeValue).format();
    reply = reply + ` for ${time} ${timeValue}`;
  }
  await updateList(listName, list);
}

async function updateList(listName, list) {
  const listUrl = `./user-lists/${listName}.json`;
  fs.writeJsonSync(listUrl, list);
}

// Roles Group

async function ensureRole(roleName) {
  // Get the role information from the file
  const role = fs.readJsonSync(ROLES_LIST)[roleName];

  let guildRole = guild.roles.cache.find(mR => mR.name === role.name);

  if (!guildRole) {
    // Create the role
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
  const roleName = role.name.toLowerCase();
  if (infractor.roles.cache.has(role.id)) {
    await this.addInfractor(roleName);
    reply = `${infractor.user.username} already has the ${roleName} role.`;
    return;
  }
  await infractor.roles.add(role).catch(err => { throw err; });
  reply = `${infractor.user.username} now has the ${roleName} role.`
}

async function removeRole(role) {
  const roleName = role.name.toLowerCase();
  if (!infractor.roles.cache.has(role.id)) {
    await this.removeInfractor(roleName)
    reply = (`This user does not have the ${roleName} role.`);
    return;
  }
  await infractor.roles.remove(role);
  reply = `${infractor.user.username} is no longer ${roleName}`;
  await this.removeInfractor(roleName);
  return true;
}

// Lists Group

async function getList(listName) {
  const listUrl = `./user-lists/${listName}.json`;
  if (!fs.pathExistsSync(listUrl)) fs.outputFileSync(listUrl, "{}");
  return fs.readJsonSync(listUrl);
}

async function fetchBans() {
  return guild.fetchBans()
    .then(banned => {
      if (!banned.array().length) {
        reply = `I have no record of any banned users.`;
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

// Guild Group

function getGuild() {
  return guild;
}

module.exports = {
  start: start,
  verifyUser: verifyUser,
  addInfractor: addInfractor,
  addInfraction: addInfraction,
  removeInfractor: removeInfractor,
  removeInfraction: removeInfraction,
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
  getGuild: getGuild,
  fetchBans: fetchBans
}