import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs-extra';
import { createLogger, format as _format, transports as _transports } from 'winston';
import moment from 'moment';
import { prefix, token } from './config.json';

// Initialize Discord Bot
const bot = new Client();
bot.commands = new Collection();

// Build a list of commands
const commandFiles = readdirSync('./commands');
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

// Initialize the logger
const logger = createLogger({
    level: 'info',
    format: _format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
    defaultMeta: { service: 'user-service' },
    transports: [new _transports.File({ filename: 'log' })]
});

// When the client is ready, run this code
bot.on('ready', () => {
    // Log the time it went online
    const now = moment().format();
    console.log(`The bot went online at: ${now}`);
    logger.log('info', `The bot went online at: ${now}`);

    // Start the automated tasks
    const muteChecker = require('./tasks/mute-checker');
    bot.setInterval(() => {
        muteChecker.check(bot.guilds);
    }, 5000);
})

bot.on('debug', m => logger.log('debug', m));
bot.on('warn', m => logger.log('warn', m));
bot.on('error', error => logger.log('error', error));
process.on('uncaughtException', error => logger.log('error', error));

// Login to Discord with the app's token
bot.login(token);

// Listen to messages
bot.on('message', message => {
    // Discard any direct messages, bot messages or messages without prefix
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

    // Check the command that was given
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (!bot.commands.has(command)) return;

    // Try to execute the command
    try {
        bot.commands.get(command).execute(message, args);
    } catch (error) {
        const now = moment().format();
        logger.log(error, now);
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