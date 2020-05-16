const fs = module.require("fs-extra");
const moment = require('moment');
const CHANNEL_LIST_URL = `./server-lists/channels.json`;

let user;
let infractor;
let guild;
let reply = '';
let reason;
let time;

function updateList(listName, list) {
  const listUrl = `./user-lists/${listName}.json`;
  fs.writeJsonSync(listUrl, list);
}

module.exports = {
  start(message, args) {
    user = message.member;
    infractor = message.mentions.members.first();
    guild = message.guild;
    reason = args.slice(1).join(' ');
    time = this.getNumber(args[1]);
  },
  getNumber(num) {
    num = parseInt(num);
    if (!num || num < 1 || num > 100 || isNaN(num))
      return;
    return num;
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
      reply = 'You need to mention a valid user!';
      return;
    }
    return infractor;
  },
  getReason() {
    if (!reason) reason = '';
    return reason;
  },
  async addInfractor(listName) {
    const list = await this.getList(listName);
    if (!list[infractor.id]) {
      list[infractor.id] = {
        id: infractor.user.id,
        name: infractor.user.username,
        guild: guild.id,
        reason: this.getReason()
      };
      updateList(listName, list);
    }
    reply = `${infractor.user.username} has been ${listName} ${this.getReason()}`;
  },
  async removeInfractor(listName) {
    const list = await this.getList(listName);
    if (!list[infractor.id]) return;
    delete list[infractor.id];
    updateList(listName, list);
    reply = `${infractor.user.username} is no longer ${listName}`
  },
  async getList(listName) {
    const listUrl = `./user-lists/${listName}.json`;
    if (!fs.pathExistsSync(listUrl)) fs.outputFileSync(listUrl, "{}");
    return fs.readJsonSync(listUrl);
  },
  async ensureRole(roleName) {
    // Get the role information from the file
    const role = fs.readJsonSync(CHANNEL_LIST_URL)[roleName];

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
        await channel.updateOverwrite(guildRole, role.inactivePermission)
          .catch(err => { throw err; })
      });
    }
    return guildRole;
  },
  async addRole(role) {
    const roleName = role.name.toLowerCase();
    if (infractor.roles.cache.has(role.id)) {
      await this.addInfractor(roleName);
      reply = (`This user already has the ${roleName} role.`);
      return;
    }
    await infractor.roles.add(role);
    await this.addInfractor(roleName);
    return true;
  },
  async removeRole(role) {
    const roleName = role.name.toLowerCase();
    if (!infractor.roles.cache.has(role.id)) {
      await this.removeInfractor(roleName)
      reply = (`This user does not have the ${roleName} role.`);
      return;
    }
    await infractor.roles.remove(role);
    await this.removeInfractor(roleName)
    return true;
  },
  async setTimer(listName, timeValue) {
    const list = this.getList(listName);
    if (time) list[infractor.id].time = moment().add(time, timeValue).format();
    updateList(listName, list);
  },
  async fetchBans() {
    return guild.fetchBans()
      .then(banned => {
        if (!banned.array().length) {
          reply = `I have no record of any banned users.`
          return;
        };
        return banned;
      })
  },
  async setInfractions(listName, infraction) {
    const list = await this.getList(listName);
    if (!list[infractor.id].infractions) {
      list[infractor.id].infractions = [];
    }
    list[infractor.user.id].infractions.push(infraction);
    updateList(listName, list);
  },
  setReply(message) {
    reply = message;
  },
  getReply() {
    return reply;
  }
}