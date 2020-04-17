const Discord = require('discord.js');
const fs = require('fs-extra');
const winston = require('winston');
const moment = require('moment');
const { prefix, token } = require('./config.json');

// Initialize Discord Bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// Initialize the logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
    defaultMeta: { service: 'user-service' },
    transports: [new winston.transports.File({ filename: 'log' })]
});

// Get a list of commands
const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

// When the client is ready, run this code
// This event will only trigger one time after logging in
bot.on('ready', () => {
    const now = moment().format();
    console.log('The bot went online at:', now);
    logger.log('info', 'The bot went online at:', now);
    const muteChecker = require('./mute-checker');
    bot.setInterval(() => {
        muteChecker.check(bot.guilds);
    }, 5000);
})

bot.on('debug', m => logger.log('debug', m));
bot.on('warn', m => logger.log('warn', m));
bot.on('error', error => logger.log('error', error));
process.on('uncaughtException', error => logger.log('error', error));

// Login to Discord with your app's token
bot.login(token);

// Listen to messages
bot.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!bot.commands.has(command)) return;

    try {
        bot.commands.get(command).execute(message, args);
    } catch (error) {
        const now = moment().format();
        logger.log(error, now);
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

bot.on("guildMemberAdd", member => {
    const guild = member.guild; // Reading property `guild` of guildmember object.
    const memberTag = '<@' + member.user.id + '>'; // GuildMembers don't have a tag property, read property user of guildmember to get the user object from it
    // Need to failsafe this in case rules channel doesn't exist.
    const rulesChannel = bot.channels.cache.find(channel => channel.name === 'rules');
    const channelTag = '<#' + rulesChannel.id + '>'
    if (guild.systemChannel) { // Checking if it's not null
        guild.systemChannel.send(`Welcome ${memberTag}! Check the ${channelTag} channel!`);
    }
});


bot.on("messageReactionAdd", function (messageReaction, user) {
    console.log(`a reaction is added to a message`);
});

bot.on("messageReactionRemove", function (messageReaction, user) {
    console.log(`a reaction is removed from a message`);
});