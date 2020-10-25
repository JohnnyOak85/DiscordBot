const { CHANNELS_LIST, ROLES_LIST } = require(`../docs/config.json`);

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

    if (list[member.id].roles.indexOf(role.id) <= -1) {
      list[member.id].roles.push(role.id);
    }

    return list[member.user.id];
  } catch (error) {
    throw error
  }
}

async function removeRole(member, list, role) {
  try {
    if (!member.roles.cache.has(role.id)) return list[member.user.id];

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

async function sendReply(channel, reply) {
  try {
    await channel.send(reply);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  ensureChannel: ensureChannel,
  ensureRole: ensureRole,
  giveRole: giveRole,
  removeRole: removeRole,
  sendReply: sendReply,
}