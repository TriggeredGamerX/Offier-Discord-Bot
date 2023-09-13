const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'avatar',
  description: 'Display the avatar of a user',
  filters: ['USER'],
    type: 'USER',
  aliases: ['av'],
  execute(message) {
    const user = message.mentions.users.first() || message.author;
    const avatarURL = user.displayAvatarURL({ dynamic: true, format: 'png', size: 4096 });

    const embed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle(`Avatar - ${user.username}`)
      .setImage(avatarURL)
      .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
      .setTimestamp();

    message.channel.send(embed);
  },
};
