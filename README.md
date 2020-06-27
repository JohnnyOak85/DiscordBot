# DiscordBot
Custom made discord bot for moderation purposes

## How to start
You need to create a configuration file first. It should be a JSON with the following arguments:
```
{
    "TOKEN": "",
    "PREFIX": "",
    "MAX_INFRACTIONS": "",
    "RULES": []
}
```
The token should be your bot token from [Discord developers](https://discordapp.com/developers/applications/).
The prefix can be whatever you feel like, I normally use '!'.
The max infractions is the number of times a user can be warned before being banned.
The rules is your own list of rules.

This will install all the dependencies needed:
```
npm install --save
```

To actually start the bot type:
```
npm start
```

## But what does it do?
**Commands**  

* Moderation:  
Kick, ban, temporary ban, remove ban, mute, temporary mute, remove mute, issue a warning, remove a warning.

* Information:  
List banned users, list all users with infractions, list a user's infractions.

* Others:  
Clear lines, list commands, give information on one command, give the moderator role to a user, list all rules.

**Automated Tasks**  

* Moderation:
Mute after a certain amount of infractions, ban after a certain amount of infractions, remove a temporary ban, remove a temporary mute, rename offensive usernames, delete messages with offensive words, delete messages with pornographic websites, bar bots, delete repeated messages, delete messages with too many mentions.

## Author
* **João Carvalho** - [JohnnyOak](http://johnnyoak85.github.io/)

## Acknowledgments
* The cool people at [The Other Side](https://discord.gg/ZrdMG2R) for helping me test.
* My friend [André Leal](https://github.com/Agleal) who's always available for help and discussing ideas.
