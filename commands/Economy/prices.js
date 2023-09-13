const { MessageEmbed } = require('discord.js');
const { generatePriceList } = require('./pricelist.js');
module.exports = {
  name: 'prices',
  description: 'List the prices of items in the stock',
  execute(message) {
    const pricelist = generatePriceList();

    const embed = new MessageEmbed()
      .setColor('#00FF00')
      .setTitle('Stock Prices')
      .setDescription('Here are the prices of items in the stock:')
      .setTimestamp();

    Object.entries(pricelist).forEach(([itemName, itemInfo]) => {
      embed.addField(itemName, `${itemInfo.price} coins`, true);
    });

    message.channel.send(embed);
  },
};
