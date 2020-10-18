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
    list[member.id] = { username: member.user.username || member.username };
  };

  if (!list[member.id].strikes) {
    list[member.id].strikes = [];
  };

  if (member._roles) {
    list[member.id].roles = member._roles;
  }

  if (member.nickname) {
    list[member.id].nickname = member.nickname;
  }

  return list[member.id]
}

// Channel Tasks

async function ensureChannel(guild, channelName) {
  try {
    const channelSchema = CHANNELS_LIST[channelName];
    let channel = guild.channels.cache.find(c => c.name === channelSchema.name);

    if (!channel) {
      channel = await guild.channels.create(channelSchema.name, {
        type: channelSchema.type,
      })
    }

    return channel;
  } catch (error) {
    throw error
  }

}

// Role Tasks

async function ensureRole(guild, roleName) {
  try {
    const roleSchema = ROLES_LIST[roleName];
    let role = guild.roles.cache.find(r => r.name === roleSchema.name);

    if (!role) {
      role = await guild.roles.create({
        data: {
          name: roleSchema.name,
          permissions: roleSchema.activePermissions
        }
      });

      guild.channels.cache.forEach(async (channel) => {
        await channel.updateOverwrite(role, roleSchema.inactivePermissions);
      });
    }

    return role;
  } catch (error) {
    throw error
  }
}

async function giveRole(member, list, role) {
  try {
    if (member.roles.cache.has(role.id)) return list[member.user.id];

    await member.roles.add(role);

    if (!list[member.user.id]) {
      list[member.user.id] = {
        username: member.user.username,
        roles: []
      };
    };

    list[member.id].roles.push(role.id);

    return list[member.user.id];
  } catch (error) {
    throw error
  }
}

async function removeRole(member, list, role) {
  try {
    await member.roles.remove(role)

    const index = list[member.user.id].roles.indexOf(role.id);

    if (index > -1) {
      list[member.user.id].roles.splice(index, 1);
    }

    return list[member.user.id];
  } catch (error) {
    throw error
  }
}

// Punishment Tasks

async function giveStrike(member, list, reason) {
  try {
    reason = ensureReason(reason);

    list[member.id] = ensureMember(list, member);
    list[member.id].strikes.push(reason);
    list[member.id].action = 'warned';
    list[member.id] = await checkStrikes(member, list, reason)

    return list[member.id];
  } catch (error) {
    throw error
  }
};

async function checkStrikes(member, list, reason) {
  try {
    const amount = list[member.user.id].strikes.length;

    if (amount === MAX_STRIKES) {
      list[member.id] = await ban(member, list, reason);
    } else if (amount >= (MAX_STRIKES / 2)) {
      list[member.id] = await mute(member, list);
    }

    return list[member.id];
  } catch (error) {
    throw error
  }
}

async function mute(member, list) {
  try {
    list[member.id] = ensureMember(list, member);

    const role = await ensureRole(member.guild, 'muted')

    list[member.id] = await giveRole(member, list, role)
    list[member.id].action = 'muted';

    return list[member.id];
  } catch (error) {
    throw error
  }
}

async function kick(member, list, reason) {
  try {
    reason = ensureReason(reason);
    list[member.id] = ensureMember(list, member);

    await member.kick(reason)

    list[member.id].action = 'kicked';

    return list[member.id];
  } catch (error) {
    throw error
  }
}

async function ban(member, list, reason) {
  try {
    reason = ensureReason(reason);
    list[member.id] = ensureMember(list, member);

    if (!list[member.id].strikes.includes(reason)) {
      list[member.id].strikes.push(reason);
    }

    await member.ban(reason)

    list[member.id].action = 'banned';
    list[member.id].banned = true;
    delete list[member.id].roles;

    return list[member.id];
  } catch (error) {
    throw error
  }
}

async function unban(member, list, guild) {
  try {
    list[member.id] = ensureMember(list, member);

    console.log(member);
    // return
    await guild.members.unban(member.id)

    list[member.id].banned = false;

    return list[member.id];
  } catch (error) {
    throw error
  }
}

async function listBans(guild) {
  try {
    const list = await guild.fetchBans()

    return list.array();
  } catch (error) {
    throw error
  }
}

// Message Tasks

function ensureReason(reason) {
  if (reason === '') {
    reason = 'No reason provided.';
  };

  return reason;
}

async function sendReply(guild, reply) {
  try {
    await guild.systemChannel.send(reply)
  } catch (error) {
    throw error
  }
}

// Time Tasks

function getDate() {
  return moment().format('Do MMMM YYYY, h:mm:ss a');
}

function addTime(amount, type) {
  return moment().add(amount, type).format();
}

function timerExpired(time) {
  if (moment(time).isBefore(moment().format())) return true;
}

// Doc Tasks

async function readDir(name) {
  try {
    const dir = fs.readdirSync(`./${name}`);
    return dir;
  } catch (error) {
    throw error
  }
}

async function ensureDoc(guild) {
  try {
    const path = `./docs/guilds/guild_${guild}.json`;

    if (!fs.pathExistsSync(path)) {
      fs.outputFileSync(path, "{}");
    }

    const doc = fs.readJsonSync(path);

    return doc;
  } catch (error) {
    throw error
  }
}

async function saveDoc(guild, doc) {
  try {
    fs.writeJsonSync(`./docs/guilds/guild_${guild}.json`, doc);
  } catch (error) {
    throw error
  }
}

async function getList(guild) {
  try {
    const doc = fs.readJsonSync(`./docs/guilds/guild_${guild}.json`);
    return doc.members;
  } catch (error) {
    throw error
  }
}

async function saveList(guild, members) {
  try {
    const path = `./docs/guilds/guild_${guild}.json`
    const doc = fs.readJsonSync(path);

    doc.members = members;
    fs.writeJsonSync(path, doc);
  } catch (error) {
    throw error
  }
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