const moment = require('moment');
const { getList, saveList } = require('./doc.helper');
const { unmute, unban } = require('./punishment.helper');

function getDate() {
    return moment().format('Do MMMM YYYY, h:mm:ss a');
}

function addTime(amount, type) {
    return moment().add(amount, type).format();
}

async function checkTimers(guilds) {
    for (const guild of guilds) {
        try {
            const list = await getList(guild[1].id);
            if (!Object.keys(list).length) return;

            for (const member of Object.keys(list)) {
                if (!list[member].timer || moment(time).isBefore(moment().format())) return;

                if (list[member].banned) {
                    await unban(member, guild);
                }

                list[member] = await unmute(list, member, guild)

                await saveList(guild.id, list);
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = {
    getDate: getDate,
    addTime: addTime,
    checkTimers: checkTimers
}