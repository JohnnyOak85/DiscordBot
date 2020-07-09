const Discord = require('discord.js');
const fs = require('fs-extra');
const winston = require('winston');
const moment = require('moment');
// Helpers
const commandHelper = require('./helpers/command-helper.js');
const messageHelper = require('./helpers/message-helper.js');
const taskHelper = require('./helpers/task-helper');

const { PREFIX, TOKEN } = require('./docs/config.json');

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
    transports: [new winston.transports.File({ filename: 'logs/log.txt' })]
});

// When the client is ready, run this code
bot.on('ready', () => {
    // Log the time it went online
    const now = moment().format();
    // logger.log('info', `The bot went online at: ${now}`);

    try {
        taskHelper.promoteBot(bot.guilds.cache, bot.user.id);
        taskHelper.buildGuildDoc(bot.guilds.cache);
        taskHelper.ensureChannel(bot.guilds.cache);
    } catch (error) {
        taskHelper.logError(error, logger);
    }


    // Start the automated tasks
    bot.setInterval(() => {
        try {
            taskHelper.checkTimers(bot.guilds.cache);
        } catch (error) {
            taskHelper.logError(error, logger);
        }
    }, 5000);

    const day = 1000 * 60 * 60 * 24;
    bot.setInterval(() => {
        try {
            taskHelper.pruneUsers(bot.guilds.cache);
        } catch (error) {
            taskHelper.logError(error, logger);
        }
    }, day);
})

bot.on('error', error => taskHelper.logError(error, logger));

// Login to Discord with the app's token
bot.login(TOKEN);

// Listen to messages
bot.on('message', message => {

    // Discard any direct messages or bot messages
    if (message.author.bot || message.channel.type === 'dm') return;

    // Check message content against spam and profanity
    //TODO record a strike
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
        taskHelper.checkUsername(newMember, newMember.nickname);
        taskHelper.checkRole(newMember);
    } catch (error) {
        taskHelper.logError(error, logger);
    }
})


// guildBanAdd
/* Emitted whenever a member is banned from a guild.
PARAMETER    TYPE          DESCRIPTION
guild        Guild         The guild that the ban occurred in
user         User          The user that was banned    */
bot.on("guildBanAdd", function(guild, user){
    console.log(`a member is banned from a guild`);
});

// guildBanRemove
/* Emitted whenever a member is unbanned from a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The guild that the unban occurred in
user         User         The user that was unbanned    */
bot.on("guildBanRemove", function(guild, user){
    console.log(`a member is unbanned from a guild`);
});

// guildMemberRemove
/* Emitted whenever a member leaves a guild, or is kicked.
PARAMETER     TYPE               DESCRIPTION
member        GuildMember        The member that has left/been kicked from the guild    */
bot.on("guildMemberRemove", function(member){
    console.log(`a member leaves a guild, or is kicked: ${member.tag}`);
});

// messageUpdate
/* Emitted whenever a message is updated - e.g. embed or content change.
PARAMETER     TYPE           DESCRIPTION
oldMessage    Message        The message before the update
newMessage    Message        The message after the update    */
bot.on("messageUpdate", function(oldMessage, newMessage){
    console.log(`a message is updated`);
});