const { ensureChannel, ensureRole } = require("./guild.helper");
const { readDir, ensureDoc } = require('./doc.helper');

const { PERMISSIONS, RULES } = require(`../docs/config.json`);

// Private

async function buildMemberList(guildMembers) {
    try {
        let members = {};

        for (const member of guildMembers) {
            if (member[1]._roles && member[1]._roles.length) {
                members[member[1].user.id] = {
                    username: member[1].user.username,
                    roles: member[1]._roles
                }
            }
        }

        return members;
    } catch (error) {
        throw error
    }
}

async function addBannedMembers(guild, members) {
    try {
        const bans = await guild.fetchBans();

        for (const member of bans) {
            if (member[1].reason === null) member[1].reason = 'No reason provided.';
            members[member[1].user.id] = {
                username: member[1].user.username,
                banned: true,
                strikes: [
                    member[1].reason
                ]
            }
        }

        return members;
    } catch (error) {
        throw error
    }
}

async function buildCategory(guild) {
    try {
        const category = await ensureChannel(guild, 'information');
        await category.setPosition(0);
        await category.updateOverwrite(guild.roles.everyone, PERMISSIONS);
        return category;
    } catch (error) {
        throw error
    }
}

async function buildRulesChannel(guild, category) {
    try {
        const channel = await ensureChannel(guild, 'rules');
        await channel.setParent(category.id);
        await channel.overwritePermissions(category.permissionOverwrites);
        return channel;
    } catch (error) {
        throw error
    }
}

async function buildSystemChannel(guild, category) {
    try {
        const channel = await ensureChannel(guild, 'events')
        await channel.setParent(category.id);
        await channel.overwritePermissions(category.permissionOverwrites);
        await guild.setSystemChannel(channel)
    } catch (error) {
        throw error
    }
}

async function setRules(channel) {
    try {
        const reply = buildReply();
        const messages = await channel.messages.fetch();

        for (const message of messages) {
            if (message[1].author.bot && message[1].content !== reply) {
                await message[1].delete();
            }
        }

        if (!messages.array().length) {
            await channel.send(`${reply}`);
        }
    } catch (error) {
        throw error
    }
}

function buildReply() {
    reply = '```markdown\n';

    for (const rule of RULES) {
        reply += `* ${rule}\n`;
    }

    reply += '```';
    return reply;
}

// Public

async function buildCommands(commandList) {
    try {
        const commands = await readDir('commands');

        for (const command of commands) {
            const file = require(`../commands/${command}`);
            await commandList.set(file.name, file);
        };
    } catch (error) {
        throw error;
    };
}

async function promote(guilds, id) {
    try {
        for (const guild of guilds) {
            const bot = guild[1].members.cache.find(u => u.user.id === id);
            const role = await ensureRole(guild[1], 'bot');
            if (bot.roles.cache.has(role.id)) return;
            await bot.roles.add(role);
        }
    } catch (error) {
        throw error;
    };
}

async function buildDoc(guilds) {
    try {
        for (const guild of guilds) {
            const doc = await ensureDoc(guild[1].id);
            if (!doc.name || !doc.members) {
                doc.name = guild[1].name;
                doc.members = await buildMemberList(guild[1].members.cache);
                doc.members = await addBannedMembers(guild[1], doc.members);
                await docHelper.saveDoc(guild[1].id, doc);
            }
        }
    } catch (error) {
        throw error;
    };
}

async function setGuild(guilds) {
    try {
        for (const guild of guilds) {
            const category = await buildCategory(guild[1]);
            const channel = await buildRulesChannel(guild[1], category);
            await buildSystemChannel(guild[1], category);
            await setRules(channel);
        }
    } catch (error) {
        throw error
    }
}

module.exports = {
    buildCommands: buildCommands,
    promote: promote,
    buildDoc: buildDoc,
    setGuild: setGuild,
}