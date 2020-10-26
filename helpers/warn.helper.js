const { ensureMember } = require('./member.helper');
const { getList, saveList } = require('./doc.helper');

const { MAX_STRIKES } = require(`../docs/config.json`);

async function warn(member, guild, reason) {
    try {
        const list = await getList(guild.id);

        if (reason === '') {
            reason = 'No reason provided.';
        };

        list[member.id] = ensureMember(list, member);
        list[member.id].strikes.push(reason);

        if (list[member.user.id].strikes.length === MAX_STRIKES) {
            await member.ban(reason);

            list[member.id].banned = true;
            delete list[member.id].roles;

            await guild.systemChannel.send(`${member.user.username} has been banned due to repeated strikes.\n${reason}`);
        }
        else if (list[member.user.id].strikes.length >= (MAX_STRIKES / 2)) {
            const role = ensureRole(guild, 'muted');

            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role);
                await guild.systemChannel.send(`${member.user.username} has been muted due to repeated strikes.\n${reason}`);
            }
        }
        else {
            await guild.systemChannel.send(`${member.user.username} has been warned.\n${reason}`);
        }

        await saveList(guild.id, list);
    } catch (error) {
        throw error;
    }
}

async function forgive(member, guild, channel, amount) {
    try {
        const list = await getList(guild.id);

        amount = parseInt(amount);

        if (!list[member.id] || !list[member.id].strikes || !list[member.id].strikes.length) {

            await channel.send(`${member.user.username} has no strikes.`)
            return;
        }

        if (amount && amount > 1 && amount <= MAX_STRIKES && !isNaN(amount)) {
            let counter = 0;

            while (counter != amount) {
                memberList[member.id].strikes.shift();
                counter++;
            }

            await guild.systemChannel.send(`${amount} strikes were removed from ${member.user.username}.`);
        }
        else {
            memberList[member.id].strikes.shift();
            await guild.systemChannel.send(`A strike was removed from ${member.user.username}.`);
        }

        await saveList(guild.id, list);
    } catch (error) {
        throw error;
    }
}

async function getStrikes(guild) {
    try {
        const list = await getList(guild.id);
        const strikes = [];

        for (const member of Object.values(list)) {
            if (member.strikes && member.strikes.length) strikes.push(member);
        }

        return strikes;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    warn: warn,
    forgive: forgive,
    getStrikes: getStrikes,
}