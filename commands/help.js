export const name = 'help'
export const description = 'help a member'
export function execute(message, args) {
    const string = "!kick - kicks a user\n!ban - bans a user\n!mute - mutes a user, you need to provide a number from 1 to 100, otherwise it will default to 5\n!unmute - unmutes a user\n!clear - clears lines, you need to provide a number from 1 to 100\n!warn - gives a user an infraction"
    message.channel.send(string)
}