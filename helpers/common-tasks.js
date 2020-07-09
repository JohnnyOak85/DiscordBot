const { ROLES_LIST } = require(`../docs/config.json`);

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

  async function getList(guild) {
    const list = fs.readJsonSync(`./docs/guilds/guild_${guild.id}.json`);
    return list.members;
  }
  
  module.exports = {
    ensureRole: ensureRole,
    getList: getList
  }