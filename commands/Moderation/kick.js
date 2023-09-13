module.exports = {
  name: 'kick',
  description: 'Kick a user from the server.',
  filters: ['ADMIN'],

  execute(message, args) {
    // Check if the user has the necessary permissions to kick
    if (!message.member.hasPermission('KICK_MEMBERS')) {
      return message.reply('You do not have permission to use this command.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Please mention a user to kick.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided.';

    member.kick(reason)
      .then(() => {
        message.reply(`Successfully kicked ${member.user.tag}.`);
      })
      .catch(error => {
        console.error(error);
        message.reply('An error occurred while trying to kick the user.');
      });
  },
};
