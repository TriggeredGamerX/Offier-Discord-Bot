// Dependencies
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
  name: 'restock', // Command name
  description: 'Restock the service stock.', // Command description
  filters: ['STOCKER'],
  /**
   * Command execute
   * @param {Message} message The message sent by the user
   * @param {string[]} args The command arguments
   */
  async execute(message, args) {
    // Check if the user has the administrator permission
    if (!message.member.hasPermission('MANAGE_CHANNELS')) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.color.red)
          .setTitle("You Don't Have Permissions!")
          .setDescription('🛑 Only Admin Can Do It HEHE')
          .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
          .setTimestamp()
      );
    }

    // Check the arguments length
    if (args.length < 1) {
      return message.channel.send(
        'Invalid arguments! Use `.restock [stock:name]`'
      );
    }

    // Get the stock name
    const stockName = args[0];

    // Check if a file is attached
    if (!message.attachments.size) {
      return message.channel.send('Please attach a .txt file to restock.');
    }

    const attachment = message.attachments.first();

    if (!attachment.name.endsWith('.txt')) {
      return message.channel.send('Please attach a valid .txt file.');
    }

    const fileBuffer = await fetchAttachment(attachment.url);

    // Read the stock file
    const filePath = `${__dirname}/../stock/${stockName}.txt`;
    fs.readFile(filePath, 'utf-8', function (err, data) {
      if (err) {
        return message.channel.send('Error reading stock file.');
      }

      // Append the new stock data
      const updatedData = `${data}\n${fileBuffer}`;

      // Write the updated stock data back to the file
      fs.writeFile(filePath, updatedData, function (err) {
        if (err) {
          return message.channel.send('Error updating stock file.');
        }

        message.channel.send(`**Stock '${stockName}' has been successfully restocked.**`);
      });
    });
  },
};

/**
 * Fetches the attachment and returns it as a string
 * @param {string} url The URL of the attachment
 * @returns {Promise<string>} The attachment content as a string
 */
function fetchAttachment(url) {
  return new Promise((resolve, reject) => {
    // Perform the necessary fetching or downloading of the attachment
    // and resolve with the attachment content as a string
    // Here, you can use any library or method to download the attachment content
    // For simplicity, I'm assuming the URL is a direct link to the file

    // Assuming 'axios' is installed as a dependency
    const axios = require('axios');

    axios
      .get(url, { responseType: 'arraybuffer' })
      .then((response) => {
        const buffer = Buffer.from(response.data, 'binary');
        const content = buffer.toString('utf-8');
        resolve(content);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
