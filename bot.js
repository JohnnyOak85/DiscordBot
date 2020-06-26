const Discord = require('discord.js');
const fs = require('fs-extra');
const winston = require('winston');
const moment = require('moment');
const { prefix, token } = require('./server-lists/config.json');
const commandHelper = require('./helpers/command-helper.js');

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
    console.log(`The bot went online at: ${now}`);
    logger.log('info', `The bot went online at: ${now}`);

    // Start the automated tasks
    const taskHelper = require('./helpers/task-helper');
    const day = 1000 * 60 * 60 * 24;
    
    bot.setInterval(() => {
        taskHelper.check(bot.guilds, 'Muted');
        taskHelper.check(bot.guilds, 'Banned');
    }, 5000);
    bot.setInterval(() => {
        taskHelper.prune(bot.guilds);
    }, day);
})

bot.on('debug', m => logger.log('debug', m));
bot.on('warn', m => logger.log('warn', m));
bot.on('error', error => logger.log('error', error.message));
process.on('uncaughtException', error => logger.log('error', error.message));

// Login to Discord with the app's token
bot.login(token);

// Listen to messages
bot.on('message', message => {
    // Discard any direct messages, bot messages or messages without prefix
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

    // Check the command that was given
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (!bot.commands.has(command)) {
        message.reply('this command isn\'t available.');
        return
    }

    // Try to execute the command
    try {
        bot.commands.get(command).execute(message, args, commandHelper);
    } catch (error) {
        const now = moment().format();
        logger.log('error', `${error.message}: ${now}`);
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

// Listen to a member join
bot.on('guildMemberAdd', member => {
    // Get the user information
    const guild = member.guild;
    const memberTag = `<@${member.user.id}>`;

    // Get the channel to tag
    const rulesChannel = bot.channels.cache.find(channel => channel.name === 'rules');
    if (!rulesChannel) {
        // Create rules channel
    }
    const channelTag = `<#${rulesChannel.id}>`;

    // Check if
    if (guild.systemChannel) {
        guild.systemChannel.send(`Welcome ${memberTag}! Check the ${channelTag} channel!`);
    }
});


bot.on('messageReactionAdd', function (messageReaction, user) {
    console.log(`a reaction is added to a message`);
});

bot.on('messageReactionRemove', function (messageReaction, user) {
    console.log(`a reaction is removed from a message`);
});