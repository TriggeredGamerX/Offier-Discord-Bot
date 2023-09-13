const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
  name: 'stock', // Command name
  description: 'Display the service stock.', // Command description
  filters: ['USER'],
  /**
   * Command execute
   * @param {Message} message The message sent by the user
   */
  execute(message) {
    // Check if the command is used in a server (guild)
    if (!message.guild) {
      return message.channel.send('This command can only be executed in a server.');
    }

    // Arrays
    const stock = [];

    // Read all of the services
    fs.readdir(`${__dirname}/../stock/`, function (err, files) {
      // If cannot scan the directory
      if (err) {
        console.error('Unable to scan directory:', err);
        return message.channel.send('An error occurred while fetching the service stock.');
      }

      // Put services into the stock
      files.forEach(function (file) {
        if (!file.endsWith('.txt')) return;
        stock.push(file);
      });

      const embed = new MessageEmbed()
        .setColor(config.color.default)
        .setTitle(`${message.guild.name} has ${stock.length > 0 ? '**services**' : '**no services**'}`)
        .setImage(config.gifurl)
        .setDescription('');

      // Set custom emojis based on stock availability
      const emoji = stock.length > 0 ? '<a:a_tick:1133408334624604272>' : '<a:across:1134542306347855993>';

      // Loop over each service
      stock.forEach(async function (data) {
        const acc = fs.readFileSync(`${__dirname}/../stock/${data}`, 'utf-8');

        // Get number of lines
        const lines = acc.split(/\r?\n/);

        // Update embed description message
        embed.description += `${emoji} **${data.replace('.txt', '')}:** \`${lines.length}\`\n`;
      });

      message.channel.send(embed);
    });
  },
};
