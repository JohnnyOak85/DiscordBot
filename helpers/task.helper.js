const fs = module.require('fs-extra');
const moment = require('moment');
const winston = require('winston');

const { CHANNELS_LIST, ROLES_LIST, MAX_STRIKES } = require(`../docs/config.json`);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
  defaultMeta: { service: 'user-service' },
  transports: [new winston.transports.File({ filename: 'logs/log.txt' })]
});

// Member Tasks

function ensureMember(list, member) {
  if (!list[member.id]) {
    list[member.id] = { username: member.user.username };
  };

  if (!list[member.id].strikes) {
    list[member.id].strikes = [];
  };

  return list[member.id]
}

// Channel Tasks

async function ensureChannel(guild, channelName) {
  const channelSchema = CHANNELS_LIST[channelName];
  let channel = guild.channels.cache.find(c => c.name === channelSchema.name);

  if (!channel) {
    channel = await guild.channels.create(channelSchema.name, {
      type: channelSchema.type,
    }).catch(err => { throw err; });
  }

  return channel;
}

// Role Tasks

async function ensureRole(guild, roleName) {
  const roleSchema = ROLES_LIST[roleName];
  let role = guild.roles.cache.find(r => r.name === roleSchema.name);

  if (!role) {
    role = await guild.roles.create({
      data: {
        name: roleSchema.name,
        permissions: roleSchema.activePermissions
      }
    }).catch(err => { throw err; });

    guild.channels.cache.forEach(async (channel) => {
      await channel.updateOverwrite(role, roleSchema.inactivePermissions)
        .catch(err => { throw err; })
    });
  }

  return role;
}

async function giveRole(member, list, role) {
  if (member.roles.cache.has(role.id)) return list[member.user.id];

  await member.roles.add(role)
    .catch(err => { throw err; });

  if (!list[member.user.id]) {
    list[member.user.id] = {
      username: member.user.username,
      roles: []
    };
  };

  list[member.id].roles.push(role.id);

  return list[member.user.id];
}

async function removeRole(member, list, role) {
  await member.roles.remove(role)
    .catch(err => { throw err });

  const index = list[member.user.id].roles.indexOf(role.id);
  if (index > -1) {
    list[member.user.id].roles.splice(index, 1);
  }

  return list[member.user.id];
}

// Punishment Tasks

async function giveStrike(member, list, reason) {
  reason = ensureReason(reason);

  list[member.id] = await ensureMember(list, member);
  list[member.id].strikes.push(reason);
  list[member.id].action = 'warned';
  list[member.id] = await checkStrikes(member, list, reason)
    .catch(error => { throw error });

  return list[member.id];
};

async function checkStrikes(member, list, reason) {
  const amount = list[member.user.id].strikes.length;

  if (amount === MAX_STRIKES) {
    list[member.id] = await ban(member, list, reason);
  } else if (amount >= (MAX_STRIKES / 2)) {
    list[member.id] = await mute(member, list, reason);
  }

  return list[member.id];
}

async function mute(member, list, reason) {
  reason = ensureReason(reason);
  list[member.id] = ensureMember(list, member);

  const role = await ensureRole(member.guild, 'muted')
    .catch(err => { throw err; });

  list[member.id] = await giveRole(member, list, role)
    .catch(err => { throw err; });

  list[member.id].action = 'muted';

  return list[member.id];
}

async function kick(member, list, reason) {
  reason = ensureReason(reason);
  list[member.id] = ensureMember(list, member);

  await member.kick(reason)
    .catch(error => { throw error });

  list[member.id].action = 'kicked';

  return list[member.id];
}

async function ban(member, list, reason) {
  reason = ensureReason(reason);
  list[member.id] = ensureMember(list, member);

  await member.ban(reason)
    .catch(error => { throw error });

  list[member.id].action = 'banned';
  list[member.id].banned = true;
  delete list[member.id].roles;

  return list[member.id];
}

async function unban(member, list, guild) {
  list[member.id] = ensureMember(list, member);

  await guild.members.unban(member.id)
    .catch(error => { throw error });

  list[member.id].banned = false;

  return list[member.id];
}

async function listBans(guild) {
  const list = await guild.fetchBans()
    .catch(err => { throw err; });

  return list.array();
}

// Message Tasks

function ensureReason(reason) {
  if (reason === '') {
    reason = 'No reason provided.';
  };

  return reason;
}

async function sendReply(guild, reply) {
  guild.systemChannel.send(reply)
    .catch(error => { throw error });
}

// Time Tasks

async function getDate() {
  return moment().format();
}

async function addTime(amount, type) {
  return moment().add(amount, type).format();
}

function timerExpired(time) {
  if (moment(time).isBefore(moment().format())) return true;
}

// Doc Tasks

async function readDir(name) {
  const dir = fs.readdirSync(`./${name}`);
  return dir;
}

async function ensureDoc(guild) {
  const path = `./docs/guilds/guild_${guild}.json`;

  if (!fs.pathExistsSync(path)) {
    fs.outputFileSync(path, "{}");
  }

  const doc = fs.readJsonSync(`./docs/guilds/guild_${guild}.json`);

  return doc;
}

async function saveDoc(guild, doc) {
  fs.writeJsonSync(`./docs/guilds/guild_${guild}.json`, doc);
}

async function getList(guild) {
  const doc = fs.readJsonSync(`./docs/guilds/guild_${guild}.json`);
  return doc.members;
}

async function saveList(guild, members) {
  const doc = fs.readJsonSync(`./docs/guilds/guild_${guild}.json`);
  doc.members = members;
  fs.writeJsonSync(`./docs/guilds/guild_${guild}.json`, doc);
}

module.exports = {
  logger: logger,
  ensureMember: ensureMember,
  ensureChannel: ensureChannel,
  ensureRole: ensureRole,
  giveRole: giveRole,
  removeRole: removeRole,
  giveStrike: giveStrike,
  kick: kick,
  ban: ban,
  unban: unban,
  listBans: listBans,
  sendReply: sendReply,
  getDate: getDate,
  addTime: addTime,
  timerExpired: timerExpired,
  readDir: readDir,
  ensureDoc: ensureDoc,
  saveDoc: saveDoc,
  getList: getList,
  saveList: saveList,
}