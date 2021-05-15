# DiscordBot
Custom made discord bot for moderation purposes

## How to start
You need to create a configuration file first. It should be a JSON with the following arguments:
```
{
    "TOKEN": "",
    "PREFIX": "",
    "MAX_STRIKES": "",
    "RULES": []
}
```
The token should be your bot token from [Discord developers](https://discordapp.com/developers/applications/).
The prefix can be whatever you feel like, I normally use '!'.
The max strikes is the number of times a user can be warned before being banned.
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
List banned users, list all users with strikes, list a user's strikes.

* Utilities:  
Clear lines, list commands, give information on one command, return a channel invite, add a rule, remove a rule.

* Fun:  
Record a birthday.

* Others:  
Ping.

**Automated Tasks**  

* Moderation:  
Mute after a certain amount of strikes, ban after a certain amount of strikes, remove a temporary ban, remove a temporary mute, rename offensive usernames, delete messages with pornographic websites.

* Anti-Spam  
Delete repeated messages, delete messages with too many mentions, delete messaged with repeated words, delete messages with too many caps.

* Utilities  
Record a users nickname and roles, give a returning user their nickname and roles, give roles on reaction.

* Fun  
Congratulate a user on their birthday, auto react upon certain trigger words.

## Author
* **João Carvalho** - [JohnnyOak](http://johnnyoak85.github.io/)

## Acknowledgments
* The cool people at [The Last Bastion](https://discord.gg/ZrdMG2R) for helping me test.
* My friend [André Leal](https://github.com/Agleal) who's always available for help and discussing ideas.
