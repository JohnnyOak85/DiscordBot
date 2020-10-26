const { Client, Collection } = require('discord.js');
const helper = require('./helpers/bot.helper');
const { TOKEN } = require(`./docs/config.json`);

const { start } = require('./helpers/bot.helper');
const { checkTimers } = require('./helpers/time.helper');
const { registerMember, updateMember } = require('./helpers/member.helper');
const { logError, logInfo } = require('./helpers/log.helper');

// Initialize Discord Bot
const bot = new Client();
bot.commands = new Collection();

bot.login(TOKEN);

bot.on('ready', async () => {
    try {
        await start(bot)
        logInfo(`The bot went online at: ${getDate()}`);

        bot.setInterval(() => {
            checkTimers(bot.guilds.cache);
            // helper.logError(error);
        }, 5000);
    } catch (error) {
        logError(error);
    }
})

bot.on('message', async message => {
    try {
        await helper.checkMessage(message);
        helper.executeCommand(message, bot.commands);
    } catch (error) {
        logError(error);
    }
});

bot.on("messageUpdate", async (oldMessage, newMessage) => {
    await helper.checkMessage(newMessage);
});

bot.on('guildMemberAdd', member => {
    try {
        registerMember(member);
    } catch (error) {
        logError(error);
    }
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
    try {
        updateMember(newMember);
    } catch (error) {
        logError(error);
    }
})

bot.on("guildBanAdd", (guild, member) => {
    try {
        helper.registerBanStatus(guild, member, true);
    } catch (error) {
        logError(error);
    }
});

bot.on("guildBanRemove", (guild, member) => {
    try {
        helper.registerBanStatus(guild, member, false);
    } catch (error) {
        logError(error);
    }
});

bot.on('error', error => logError(error));