const fs = module.require("fs-extra");
const moment = require('moment');
const CHANNEL_LIST_URL = `./server-lists/channels.json`;

let user;
let infractor;
let guild;
let reply;
let reason;

async function updateList(listName, list) {
  const listUrl = `./user-lists/${listName}.json`;
  fs.writeJsonSync(listUrl, list);
}

module.exports = {
  start(message, args) {
    user = message.member;
    infractor = message.mentions.members.first();
    guild = message.guild;
    reason = args.slice(1).join(' ');
    reply = '';
  },
  verifyUser(permission) {
    // Check if the user that issued the command has permissions
    if (!user.hasPermission(permission)) {
      reply = 'You do not have permission for this command!'
      return;
    }
    return true;
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
      await updateList(listName, list);
    }
    reply = `${infractor.user.username} has been ${listName} ${this.getReason()}`;
  },
  async removeInfractor(listName) {
    const list = await this.getList(listName);
    if (!list[infractor.id]) return;
    delete list[infractor.id];
    await updateList(listName, list);
    reply = `${infractor.user.username} is no longer ${listName}`
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
  async addInfractions(listName, infraction) {
    const list = await this.getList(listName);
    if (!list[infractor.id] && !list[infractor.id].infractions) {
      list[infractor.id].infractions = [];
    }
    list[infractor.user.id].infractions.push(infraction);
    delete list[infractor.user.id].reason;
    await updateList(listName, list);
  },
  async removeInfraction(listName) {
    const list = await this.getList(listName);
    if (!list[infractor.id] && !list[infractor.id].infractions) {
      reply = 'This user has no previous infractions.';
      return;
    }
    list[infractor.id].infractions.shift();
    await updateList(listName, list);
    reply = `An infraction was removed from ${infractor.user.username}`;
  },
  async startTimer(listName, num, timeValue) {
    const list = await this.getList(listName);
    const time = this.getNumber(num);
    if (time) {
      list[infractor.id].time = moment().add(time, timeValue).format();
      reply = reply + ` for ${time} ${timeValue}`;
    }
    await updateList(listName, list);
  },
  setReply(message) {
    reply = message;
  },
  getReply() {
    return reply;
  },
  getNumber(num) {
    num = parseInt(num);
    if (!num || num < 1 || num > 100 || isNaN(num))
      return;
    return num;
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
  setReason(string) {
    reason = string;
  },
  async getList(listName) {
    const listUrl = `./user-lists/${listName}.json`;
    if (!fs.pathExistsSync(listUrl)) fs.outputFileSync(listUrl, "{}");
    return fs.readJsonSync(listUrl);
  },
}