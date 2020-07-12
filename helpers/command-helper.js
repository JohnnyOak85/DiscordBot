const fs = module.require("fs-extra");
const moment = require('moment');
const helper = require('./common-tasks.js');

let member;
let guild;
let reply = '';
let reason = '';
let memberList;

function start(message, args) {
  member = message.mentions.members.first();
  guild = message.guild;
  reason = args.slice(1).join(' ');
  memberList = helper.getList(message.guild);
}

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

// Member Tasks

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

function findMember() {
  const list = fetchBans();
  member = list.find(m => m.user.username.includes(username));

  if (!member) {
    reply = 'You need to mention a valid user!';
  }
}

// Role Tasks

async function addRole(roleName) {
  const role = await helper.ensureRole(guild, roleName)
    .catch(err => { throw err; });

  if (member.roles.cache.has(role.id)) {
    if (memberList[member.id].action != 'warned') return;
    reply = `${member.user.username} is already ${roleName}.`;
    return;
  }

  memberList[member.user.id] = await helper.giveRole(member, memberList, role)
    .catch(err => { throw err; });

  reply = `${member.user.username} is now ${roleName}.\n${reason}`;
}

async function removeRole(roleName) {
  const role = await helper.ensureRole(guild, roleName)
    .catch(err => { throw err; });

  if (!member.roles.cache.has(role.id)) {
    reply = `${member.user.username} is not ${roleName}.`;
    return;
  }

  memberList[member.user.id] = await helper.removeRole(member, memberList, role)
    .catch(err => { throw err; });

  reply = `${member.user.username} is no longer ${roleName}`;
}

// Strike Tasks

async function giveStrike() {
  memberList[member.id] = await helper.giveStrike(member, memberList, reason)
    .catch(err => { throw err; });

  if (memberList[member.id].action != 'warned') {
    reply = checkAction();
    return;
  }

  reply = `${member.user.username} has been ${memberList[member.id].action}.\n${reason}`;
}

async function removeStrike() {
  if (!memberList[member.id] || !memberList[member.id].strikes || !memberList[member.id].strikes.length) {
    reply = `${member.user.username} has no strikes.`;
    return;
  }
  memberList[member.id].strikes.shift();
  reply = `An strike was removed from ${member.user.username}`;
}

async function getStrikesList() {
  const list = [];
  Object.values(memberList).forEach(member => {
    if (member.strikes && member.strikes.length) {
      list.push(member);
    }
  });
  return list;
}

// Punish Tasks

async function kickMember() {
  if (memberList[member.id].action === 'banned') {
    reply = checkAction();
    return;
  }

  memberList[member.id] = await helper.kick(member, memberList, reason)
    .catch(err => { throw err; });

  reply = `${member.user.username} has been ${memberList[member.id].action}.\n${reason}`;
}

async function banMember() {
  if (memberList[member.id].action != 'banned') {
    memberList[member.id] = await helper.ban(member, memberList, reason)
      .catch(err => { throw err; });
  }

  reply = `${member.user.username} has been ${memberList[member.id].action}.\n${reason}`;
}

async function unbanMember(username) {
  findMember(username);
  if (!member) return;

  helper.unban(member, memberList, guild)
    .catch(err => { throw err; });

  reply = `${member.user.username} has been unbanned.`;
}

async function getBansList() {
  const list = await guild.fetchBans()
    .catch(err => { throw err; });

  return list.array();
  return guild.fetchBans()
    .then(banned => {
      return banned;
    })
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

// Utility Tasks

function getNumber(num) {
  num = parseInt(num);
  if (!num || num < 1 || num > 100 || isNaN(num))
    return;
  return num;
}

async function startTimer(num, timeValue) {
  const time = getNumber(num);
  reply = reply.replace(num, '');

  if (time) {
    memberList[member.id].timer = moment().add(time, timeValue).format();
    reply = `${reply} for ${time} ${timeValue}`;
  }
}

// Doc Tasks

async function saveDoc() {
  delete memberList[member.id].action;
  await helper.saveDoc(guild.id, memberList);
}

module.exports = {
  start: start,
  verifyUser: verifyUser,
  getMember: getMember,
  checkMember: checkMember,
  addRole: addRole,
  removeRole: removeRole,
  giveStrike: giveStrike,
  removeStrike: removeStrike,
  getStrikesList: getStrikesList,
  kickMember: kickMember,
  banMember: banMember,
  unbanMember: unbanMember,
  getBansList: getBansList,
  setReply: setReply,
  getReply: getReply,
  getNumber: getNumber,
  startTimer: startTimer,
  saveDoc: saveDoc
}