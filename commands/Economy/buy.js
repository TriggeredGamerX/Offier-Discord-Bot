const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose(); // Import SQLite library

const config = require('../../config.json');
const { generatePriceList } = require('./pricelist.js');

// Create the database connection
const dbFile = './economy.db';
const db = new sqlite3.Database(dbFile);
const stockDir = '../../stock';

module.exports = {
  name: 'buy',
  description: 'Buy an item from the stock',
  execute(message, args) {
    const item = args[0];

    if (!item) {
      message.channel.send('Please provide the name of the item you want to buy.');
      return;
    }

    const pricelist = generatePriceList();
    const itemInfo = pricelist[item];

    if (!itemInfo) {
      message.channel.send('The item you requested does not exist in the stock.');
      return;
    }

    const price = itemInfo.price;

    // Check if the user has enough balance to make the purchase
    const userId = message.author.id;
    db.get('SELECT balance FROM economy WHERE user_id = ?', userId, (err, row) => {
      if (err) {
        console.error('Error fetching user balance:', err);
        return;
      }

      const balance = row ? row.balance : 0;

      if (balance < price) {
        message.channel.send('You do not have enough balance to buy this item.');
        return;
      }

      // Deduct the price from the user's balance
      db.run('UPDATE economy SET balance = balance - ? WHERE user_id = ?', price, userId, (err) => {
        if (err) {
          console.error('Error deducting balance:', err);
          return;
        }

        // Get the item's stock file path
        const filePath = `${stockDir}/${item}.txt`;

        // Read the stock file
        fs.readFile(filePath, function (error, data) {
          if (error) {
            console.error('Error reading stock file:', error);
            return;
          }

          // Get the first line (account)
          const position = data.toString().indexOf('\n');
          const firstLine = data.slice(0, position);

          // Remove the first line from the stock file
          const newData = data.slice(position + 1);
          fs.writeFile(filePath, newData, function (error) {
            if (error) {
              console.error('Error updating stock:', error);
              return;
            }

            // Send the purchased item to the user's DM
            const embedMessage = new MessageEmbed()
              .setColor('GREEN')
              .setTitle('Purchased Item')
              .setDescription(`Congratulations! You have purchased ${item} for ${price} coins.`)
              .addField('Account', `\`\`\`${firstLine}\`\`\``)
              .setFooter('Thank you for your purchase!')
              .setTimestamp();

            message.author.send(embedMessage);

            // Send the success message to the channel where the user executed the command
            message.channel.send(`${message.author}, you have successfully purchased ${item} for ${price} coins.`);
          });
        });
      });
    });
  },
};
