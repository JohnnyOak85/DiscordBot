const fs = module.require("fs-extra");
const moment = require('moment');

let user;
let infractor;
let guild;
let reply;
let reason;

function getList(listName) {
  const listUrl = `./lists/${listName}.json`;
  if (!fs.pathExistsSync(listUrl)) fs.outputFileSync(listUrl, "{}");
  return fs.readJsonSync(listUrl);
}

function updateList(listName, list) {
  const listUrl = `./lists/${listName}.json`;
  fs.writeJsonSync(listUrl, list);
}

function getReason() {
  if (!reason) reason = '';
  return reason;
}

async function createRole(roleName) {
  // Ensure the list of channels exists
  const listUrl = `./lists/channels.json`;
  if (!fs.pathExistsSync(listUrl)) fs.outputFileSync(listUrl, "{}");

  // Get the role information from the file
  const role = fs.readJsonSync(listUrl)[roleName.toLowerCase()];

  // Create the role
  const guildRole = await guild.roles.create({
    data: {
      name: roleName,
      permissions: role.activePermissions
    }
  }).catch(err => { throw err; })

  // Update channel permissions
  guild.channels.cache.forEach(async (channel) => {
    await channel.updateOverwrite(guildRole, role.inactivePermission)
      .catch(err => { throw err; })
  });
  return guildRole;
}

async function getRole(roleName) {
  let role = guild.roles.cache.find(mR => mR.name === roleName);
  if (!role) role = await createRole(roleName);
  return role;
}

function getAmount(num) {
  let amount = parseInt(num);
  if (!amount || amount < 1 || amount > 100 || isNaN(amount))
    amount = 5;
  return amount;
}

module.exports = {
  start(message, args) {
    user = message.member;
    infractor = message.mentions.members.first();
    guild = message.guild;
    reason = args.slice(1).join(' ');
    amount = getAmount(args[1]);
  },
  verifyUser(permission) {
    // Check if the user that issued the command has permissions
    if (!user.hasPermission(permission)) {
      reply = 'You do not have permission for this command!'
      return;
    }
    return true;
  },
  getInfractor() {
    if (!infractor || !infractor.manageable) {
      reply = 'You need to mention a valid user!'
      return;
    }
    return infractor;
  },
  async removeInfractor(listName) {
    const list = getList(listName);
    if (list[infractor.id]) delete list[infractor.id];
    updateList(listName, list);
  },
  async addInfractor(listName) {
    const list = getList(listName);
    if (!list[infractor.id]) list[infractor.id] = {
      name: infractor.user.username,
      guild: guild.id,
      reason: getReason()
    };
    updateList(listName, list);
    reply = `${infractor.user.username} has been ${listName}!\n${getReason()}`
  },
  getReply() {
    return reply;
  },
  async addRole(roleName) {
    const role = await getRole(roleName)
    if (infractor.roles.cache.has(role.id)) {
      reply = (`This user already has the ${roleName} role.`);
      return;
    }
    await infractor.roles.add(role);
    return true;
  },
  async setTimer(listName) {
    const list = getList(listName);
    list[infractor.id].time = moment().add(amount, 'minutes').format();
    updateList(listName, list);
  }
}