const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'purge',
  description: 'Delete a specified number of messages.',
  filters: ['ADMIN'],
  execute(message, args) {
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply('Please provide a valid number of messages to delete.');
    }

    if (amount > 1000) {
      return message.reply('You can only delete up to 1000 messages at once.');
    }

    const ownerId = config.ownerID;
    if (message.author.id !== ownerId) {
      return message.reply('Only the bot owner can perform this command.');
    }

    message.channel.bulkDelete(amount + 1)
      .then((deletedMessages) => {
        const successEmbed = new MessageEmbed()
          .setColor(config.color.success)
          .setDescription(`Successfully deleted ${deletedMessages.size - 1} messages.`);

        message.channel.send(successEmbed)
          .then((msg) => {
            msg.delete({ timeout: 3000 });
          });
        
        // Log the purged messages
        const logEmbed = new MessageEmbed()
          .setColor(config.color.log)
          .setTitle('Messages Purged')
          .addField('Channel', message.channel)
          .addField('Moderator', message.author)
          .addField('Number of Messages', deletedMessages.size - 1)
          .setTimestamp();

        const logChannel = message.guild.channels.cache.find(channel => channel.name === 'logs');
        if (logChannel) {
          logChannel.send(logEmbed);
        }
      })
      .catch(error => {
        if (error.code === 10008) {
          // Message not found, already deleted
          console.log('Message already deleted or not found.');
        } else {
          console.error('Error purging messages:', error);
          message.reply('An error occurred while purging messages.');
        }
      });
  },
};
