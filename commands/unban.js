module.exports = {
    name: 'unban',
    description: 'Unban a member',
    execute(message, args) {
        // if (!message.member.hasPermission('BAN_MEMBERS')) return;
        const member = message.mentions.members.first().user.id;
        
        console.log('member:', member);
        console.log('member ID:', memberID);
        // if (member) {
        //     member.ban();
        // }
        // else {
        //     message.reply('you need to mention a valid member!');
        // }
    }
}