export const name = 'kick';
export const description = 'Kick a member';
export function execute(message, args) {
    // Check if the user that issued the command has permissions
    if (!message.member.hasPermission('KICK_MEMBERS'))
        return message.reply('you do not have permission for this command!');

    // Get the infractor to apply the command to
    const infractor = message.mentions.members.first();
    if (!infractor || !infractor.manageable)
        return message.reply('you need to mention a valid user!');

    // Get the reason for the command if any was given
    let reason = args.slice(1).join(' ');
    if (!reason) reason = '';

    // Apply the command
    infractor.kick(reason).catch(error => message.reply(`Sorry I couldn't execute this command because of : ${error}`));
    message.channel.send(`${infractor.user.username} has been kicked!\n${reason}`);
}