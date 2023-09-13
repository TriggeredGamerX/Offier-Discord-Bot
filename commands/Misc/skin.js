const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'skin',
  description: 'Download Minecraft skin by username.',
  filters: ['USER'],
  execute(message, args) {
    if (args.length < 1) {
      return message.reply('Usage: .skin <username>');
    }

    const username = args[0];

    // Make a request to Mojang API to get the UUID of the player
    axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
      .then(response => {
        const uuid = response.data.id;

        // Get the skin texture from Crafatar API
        axios.get(`https://crafatar.com/renders/body/${uuid}`)
          .then(response => {
            const skinUrl = response.request.res.responseUrl;

            // Create an embed to display the skin
            const embed = new MessageEmbed()
              .setColor('#0099ff')
              .setTitle(`${username}'s Minecraft Skin`)
              .setDescription(`**Username: ${username}**`)
              .setImage(skinUrl)
              .setFooter('Skin provided by Join For Rewards');

            // Send the embed with the skin
            message.channel.send(embed);
          })
          .catch(error => {
            console.error('Error fetching skin:', error);
            message.channel.send('Error fetching skin. Please try again later.');
          });
      })
      .catch(error => {
        console.error('Error fetching player UUID:', error);
        message.channel.send('Player not found. Please check the username and try again.');
      });
  },
};
