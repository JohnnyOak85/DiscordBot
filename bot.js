const Discord = require('discord.js');
const helper = require('./helpers/bot.helper');
const { TOKEN } = require(`./docs/config.json`);

// Initialize Discord Bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

bot.login(TOKEN);

bot.on('ready', () => {
    try {
        helper.start(bot)
    } catch (error) {
        helper.logError(error);
    }

    bot.setInterval(() => {
        try {
            helper.checkTimers(bot.guilds.cache);
        } catch (error) {
            helper.logError(error);
        }
    }, 5000);
})

bot.on('message', message => {
    if (message.author.bot) return;

    try {
        helper.checkMessage(message);
        helper.executeCommand(message, bot.commands);
    } catch (error) {
        helper.logError(error);
    }
});

bot.on("messageUpdate", function (oldMessage, newMessage) {
    helper.checkMessage(newMessage);
});

bot.on('guildMemberAdd', member => {
    try {
        helper.checkMember(member);
    } catch (error) {
        helper.logError(error);
    }
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
    try {
        helper.updateMember(newMember);
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