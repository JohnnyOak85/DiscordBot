const { Client, Collection } = require('discord.js');
const helper = require('./helpers/bot.helper');
const { TOKEN } = require(`./docs/config.json`);

const { checkTimers } = require('./helpers/timer.helper');
const { checkMember, updateMember } = require('./helpers/member.helper');

// Initialize Discord Bot
const bot = new Client();
bot.commands = new Collection();

bot.login(TOKEN);

bot.on('ready', () => {
    try {
        helper.start(bot)

        bot.setInterval(() => {
            checkTimers(bot.guilds.cache);
            // helper.logError(error);
        }, 5000);
    } catch (error) {
        helper.logError(error);
    }
})

bot.on('message', async message => {
    try {
        await helper.checkMessage(message);
        helper.executeCommand(message, bot.commands);
    } catch (error) {
        helper.logError(error);
    }
});

bot.on("messageUpdate", async (oldMessage, newMessage) => {
    await helper.checkMessage(newMessage);
});

bot.on('guildMemberAdd', member => {
    try {
        checkMember(member);
    } catch (error) {
        helper.logError(error);
    }
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
    try {
        updateMember(newMember);
    } catch (error) {
        helper.logError(error);
    }
})

bot.on("guildBanAdd", (guild, member) => {
    try {
        helper.registerBanStatus(guild, member, true);
    } catch (error) {
        helper.logError(error);
    }
});

bot.on("guildBanRemove", (guild, member) => {
    try {
        helper.registerBanStatus(guild, member, false);
    } catch (error) {
        helper.logError(error);
    }
});

bot.on('error', error => helper.logError(error));