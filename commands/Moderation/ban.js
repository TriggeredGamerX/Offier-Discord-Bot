const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a user from the server.',
  filters: ['ADMIN'],

  execute(message, args) {
    // Check if the user has the necessary permissions to ban
    if (!message.member.hasPermission('BAN_MEMBERS')) {
      return message.reply('You do not have permission to use this command.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Please mention a user to ban.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided.';
    
    member.ban({ reason })
      .then(() => {
        const banEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(`Banned ${member.user.tag}`)
          .addField('User', member.user.tag, true)
          .addField('Moderator', message.author.tag, true)
          .addField('Reason', reason)
          .setTimestamp();

        message.channel.send(banEmbed);
      })
      .catch(error => {
        console.error(error);
        message.reply('An error occurred while trying to ban the user.');
      });
  },
};
