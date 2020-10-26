const { ensureRole, giveRole, removeRole, sendReply } = require("./guild.helper");
const { giveStrike, kick, ban, listBans } = require('./punishment.helper');
const { addTime } = require('./time.helper');
const { getList, saveList } = require('./doc.helper');


let member;
let guild;
let reply = '';
let reason = '';
let memberList;

async function setup(message, args) {
  try {
    member = await message.mentions.members.first();
    guild = message.guild;
    reason = args.slice(1).join(' ');
    memberList = await getList(message.guild.id);
  } catch (error) {
    throw error
  }
}

// Member Tasks

function verifyUser(user, permission) {
  if (!user.hasPermission(permission)) {
    reply = 'You do not have permission for this command!';
    return;
  }
  if (member && user.id === member.user.id) {
    reply = 'You cannot moderate yourself!';
    return;
  }
  return true;
}

function getMember() {
  return member;
}

function checkMember() {
  if (!member) {
    reply = 'You need to mention a valid user!';
    return;
  }
  if (!member.manageable) {
    reply = 'You cannot moderate this user.';
    return;
  }
  return true;
}

// Role Tasks

async function addRole(roleName) {
  try {
    const role = await ensureRole(guild, roleName);

    if (member.roles.cache.has(role.id)) {
      if (memberList[member.id].action != 'warned') return;
      reply = `${member.user.username} is already ${roleName}.`;
      return;
    }

    memberList[member.user.id] = await giveRole(member, memberList, role);
    reply = `${member.user.username} is now ${roleName}.\n${reason}`;
  } catch (error) {
    throw error
  }
}

async function unmute(roleName) {
  try {
    const role = await ensureRole(guild, roleName);

    if (!member.roles.cache.has(role.id)) {
      reply = `${member.user.username} is not ${roleName}.`;
      return;
    }

    memberList[member.user.id] = await removeRole(member, memberList, role);
    reply = `${member.user.username} is no longer ${roleName}`;
  } catch (error) {
    throw error
  }
}

// Punishment Tasks

async function issueStrike() {
  try {
    memberList[member.id] = await giveStrike(member, memberList, reason)

    if (memberList[member.id].action != 'warned') {
      checkAction();
      return;
    }

    reply = `${member.user.username} has been ${memberList[member.id].action}.\n${reason}`;
  } catch (error) {
    throw error
  }
}

function removeStrike() {
  if (!memberList[member.id] || !memberList[member.id].strikes || !memberList[member.id].strikes.length) {
    reply = `${member.user.username} has no strikes.`;
    return;
  }

  memberList[member.id].strikes.shift();
  reply = `A strike was removed from ${member.user.username}`;
}

function getStrikesList() {
  const list = [];

  Object.values(memberList).forEach(member => {
    if (member.strikes && member.strikes.length) {
      list.push(member);
    }
  });

  return list;
}

async function kickMember() {
  try {
    if (memberList[member.id].action === 'banned') {
      checkAction();
      return;
    }

    memberList[member.id] = await kick(member, memberList, reason)
    reply = `${member.user.username} has been ${memberList[member.id].action}.\n${reason}`;
  } catch (error) {
    throw error
  }
}

async function banMember() {
  try {
    if (memberList[member.id].action != 'banned') {
      memberList[member.id] = await ban(member, memberList, reason)
    }

    reply = `${member.user.username} has been ${memberList[member.id].action}.\n${reason}`;
  } catch (error) {
    throw error
  }
}

// Message Tasks

function getReply() {
  return reply;
}

function setReply(message) {
  reply = message;
}

function checkAction() {
  reply = `${member.user.username} has been ${memberList[member.id].action} due to repeated strikes.\n${reason}`;
}

async function deleteMessages(channel, amount) {
  try {
    await channel.bulkDelete(amount + 1, true);
  } catch (error) {
    throw error;
  }
};

// Math Tasks

function getNumber(num) {
  num = parseInt(num);
  if (!num || num < 1 || num > 100 || isNaN(num))
    return;
  return num;
}

// Time Tasks

function startTimer(num, type) {
  const amount = getNumber(num);
  reply = reply.replace(num, '');

  if (amount) {
    memberList[member.id].timer = addTime(amount, type);
    reply = `${reply} for ${amount} ${type}`;
  }
}

// Doc Tasks

async function saveMembers() {
  try {
    delete memberList[member.id].action;
    await saveList(guild.id, memberList);
  } catch (error) {
    throw error
  }
}

module.exports = {
  setup: setup,
  verifyUser: verifyUser,
  getMember: getMember,
  checkMember: checkMember,
  addRole: addRole,
  unmute: unmute,
  issueStrike: issueStrike,
  removeStrike: removeStrike,
  getStrikesList: getStrikesList,
  kickMember: kickMember,
  banMember: banMember,
  listBans: listBans,
  setReply: setReply,
  getReply: getReply,
  sendReply: sendReply,
  deleteMessages: deleteMessages,
  getNumber: getNumber,
  startTimer: startTimer,
  saveMembers: saveMembers
}