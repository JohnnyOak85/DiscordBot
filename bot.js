const Discord = require('discord.js');
const winston = require('winston');

const helper = require('./helpers/bot.helper');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
    defaultMeta: { service: 'user-service' },
    transports: [new winston.transports.File({ filename: 'logs/log.txt' })]
});

// Initialize Discord Bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
helper.buildCommands(bot.commands);

bot.login(helper.getToken());

bot.on('ready', () => {
    helper.logInfo(logger);

    try {
        helper.promote(bot.guilds.cache, bot.user.id);
        helper.buildDoc(bot.guilds.cache);
        helper.buildCategory(bot.guilds.cache);
    } catch (error) {
        helper.logError(error, logger);
    }

    bot.setInterval(() => {
        try {
            helper.checkTimers(bot.guilds.cache);
        } catch (error) {
            helper.logError(error, logger);
        }
    }, 5000);
})

// Listen to messages
bot.on('message', message => {
    if (message.author.bot) return;

    try {
        helper.checkMessage(message);
        helper.executeCommand(message, bot.commands);
    } catch (error) {
        helper.logError(error, logger);
    }
});

// Listen to a member join
bot.on('guildMemberAdd', member => {
    try {
        helper.checkMember(member);
    } catch (error) {
        helper.logError(error, logger);
    }
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
    try {
        helper.updateMember(newMember);
    } catch (error) {
        helper.logError(error, logger);
    }
})

bot.on("guildBanAdd", (guild, member) => {
    try {
        helper.registerBanStatus(guild, member, true);
    } catch (error) {
        helper.logError(error, logger);
    }
});

bot.on("guildBanRemove", (guild, member) => {
    try {
        helper.registerBanStatus(guild, member, false);
    } catch (error) {
        helper.logError(error, logger);
    }
});

// messageUpdate
/* Emitted whenever a message is updated - e.g. embed or content change.
PARAMETER     TYPE           DESCRIPTION
oldMessage    Message        The message before the update
newMessage    Message        The message after the update    */
bot.on("messageUpdate", function (oldMessage, newMessage) {
    console.log(`a message is updated`);
});

bot.on('error', error => helper.logError(error, logger));