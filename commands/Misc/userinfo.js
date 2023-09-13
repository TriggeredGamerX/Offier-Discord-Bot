const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'userinfo',
  description: 'Get information about a user.',
  execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const member = message.guild.members.cache.get(user.id);
    const joinedAt = member.joinedAt.toLocaleDateString();
    const createdAt = user.createdAt.toLocaleDateString();

    const embed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle('**User Information**')
      .addField(' <:members:1124383073660833982> __Username__', user.username, true)
      .addField(' <a:hastag:1124994684763258880> __Tag__', user.tag, true)
      .addField('🪪 __User ID__', user.id)
      .addField(' <a:blobjoin:1124994330856259595> __Joined Server At__', joinedAt)
      .addField('� __Account Created At__', createdAt)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.channel.send(embed);
  },
};
