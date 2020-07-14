const { PERMISSIONS, RULES } = require(`../docs/config.json`);

let helper;

function setHelper(taskHelper) {
    helper = taskHelper;
}

async function buildCommands(commandList) {
    const commands = await helper.readDir('commands');
    commands.forEach(command => {
        const file = require(`../commands/${command}`);
        commandList.set(file.name, file);
    })
}

async function promote(guilds, id) {
    guilds.forEach(guild => {
        const bot = guild.members.cache.find(u => u.user.id === id);
        helper.ensureRole(guild, 'bot')
            .then(role => {
                if (bot.roles.cache.has(role.id)) return;
                bot.roles.add(role)
            })
            .catch(err => { throw err; });
    })
}

async function buildDoc(guilds) {
    guilds.forEach(guild => {
        helper.ensureDoc(guild.id)
            .then(doc => {
                if (!doc.name || !doc.members) {
                    doc.name = guild.name;
                    buildMemberList(guild)
                        .then(members => {
                            doc.members = members;
                            helper.saveDoc(guild.id, doc);
                        })
                }
            })
            .catch(err => { throw err });

    })
}

async function buildMemberList(guild) {
    const members = {};
    guild.members.cache.forEach(member => {
        if (member._roles.length) {
            members[member.user.id] = {
                username: member.user.username,
                roles: member._roles
            }
        }
    })

    guild.fetchBans().then(res => {
        res.forEach(member => {
            if (member.reason === null) member.reason = 'No reason provided.';
            members[member.user.id] = {
                username: member.user.username,
                banned: true,
                strikes: [
                    member.reason
                ]
            }
        })
    })
        .catch(err => { throw err });

    return members;
}

async function buildCategory(guilds) {
    guilds.forEach(guild => {
        helper.ensureChannel(guild, 'information')
            .then(category => {
                category.setPosition(0);
                category.updateOverwrite(guild.roles.everyone, PERMISSIONS)
                    .then(category => {
                        helper.ensureChannel(guild, 'rules')
                            .then(channel => {
                                channel.setParent(category.id);
                                channel.overwritePermissions(category.permissionOverwrites);
                                channel.messages.fetch().then(message => {
                                    const reply = buildReply();
                                    if (message.content === reply) return;
                                    message.delete();
                                    channel.send(`${reply}`);
                                })
                            });
                        helper.ensureChannel(guild, 'events')
                            .then(channel => {
                                channel.setParent(category.id);
                                channel.overwritePermissions(category.permissionOverwrites);
                                guild.setSystemChannel(channel)
                            });
                    });
            })
            .catch(err => { throw err; });
    })
}

function buildReply() {
    reply = '```markdown\n';
    RULES.forEach(rule => {
        reply += `* ${rule}\n`;
    })
    reply += '```';
}

module.exports = {
    setHelper: setHelper,
    buildCommands: buildCommands,
    promote: promote,
    buildDoc: buildDoc,
    buildCategory: buildCategory,
}