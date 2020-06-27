const Discord = require('discord.js');
const fs = require('fs-extra');
const winston = require('winston');
const moment = require('moment');
// Helpers
const commandHelper = require('./helpers/command-helper.js');
const messageHelper = require('./helpers/message-helper.js');
const taskHelper = require('./helpers/task-helper');

const { PREFIX, TOKEN } = require('./server-lists/config.json');

// Initialize Discord Bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.commandHelp = new Discord.Collection();

// Build a list of commands
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
    bot.commandHelp.set(command.name, command.description);
}

// Initialize the logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
    defaultMeta: { service: 'user-service' },
    transports: [new winston.transports.File({ filename: 'log' })]
});

// When the client is ready, run this code
bot.on('ready', () => {
    // Log the time it went online
    const now = moment().format();
    logger.log('info', `The bot went online at: ${now}`);

    // Start the automated tasks
    bot.setInterval(() => {
        try {
            taskHelper.check(bot.guilds, 'Muted');
            taskHelper.check(bot.guilds, 'Banned');
        } catch (error) {
            taskHelper.logError(error, logger);
        }

    }, 5000);

    const day = 1000 * 60 * 60 * 24;
    bot.setInterval(() => {
        taskHelper.prune(bot.guilds);
    }, day);
})

bot.on('error', error => logger.log('error', error.message));
process.on('uncaughtException', error => logger.log('error', error.message));

// Login to Discord with the app's token
bot.login(TOKEN);

// Listen to messages
bot.on('message', message => {

    // Discard any direct messages or bot messages
    if (message.author.bot || message.channel.type === 'dm') return;

    // Check message content against spam and profanity
    try {
        if (!messageHelper.isSafe(message)) return;
    } catch (error) {
        taskHelper.logError(error, logger);
    }

    // Discard messages without prefix
    if (!message.content.startsWith(PREFIX)) return;

    // Check the command that was given
    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (!bot.commands.has(command)) {
        message.reply(`this command isn't available.`);
        return
    }

    // Try to execute the command
    try {
        bot.commands.get(command).execute(message, args, commandHelper);
    } catch (error) {
        taskHelper.logError(error, logger);
        message.reply('there was an error trying to execute that command!');
    }
});

// Listen to a member join
bot.on('guildMemberAdd', member => {
    try {
        taskHelper.triage(member);
    } catch (error) {
        taskHelper.logError(error, logger);
    }
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
    try {
        if (!newMember.nickname) return;
        taskHelper.checkUsername(newMember);
    } catch (error) {
        taskHelper.logError(error, logger);
    }
})