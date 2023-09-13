const { MessageEmbed } = require('discord.js');
const axios = require('axios');

const API_KEY = 'f6b49079-f694-4f3f-9089-b7bec9df5d85'; // Replace with your actual Hypixel API key

module.exports = {
  name: 'skyblock',
  description: 'Check the Hypixel SkyBlock balance of a specific player.',
  filters: ['USER'],
    type: 'USER',
  execute(message, args) {
    if (args.length < 1) {
      return message.reply('Usage: .viewbalance <username>');
    }

    const username = args[0];

    // Make a request to Mojang API to get the UUID of the player
    axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
      .then(response => {
        const uuid = response.data.id;

        // Make a request to Hypixel API to get the player's Hypixel SkyBlock profile
        axios.get(`https://api.hypixel.net/skyblock/profiles?key=${API_KEY}&uuid=${uuid}`)
          .then(response => {
            const skyblockProfiles = response.data.profiles;
            if (!skyblockProfiles || skyblockProfiles.length === 0) {
              return message.channel.send('No Hypixel SkyBlock profile found for this player.');
            }

            let totalCoins = 0;
            let totalPurse = 0;
            let totalBank = 0;
            let totalCoopBank = 0; // New variable for coop bank balance
            const inventoryItems = [];

            // Loop through each Hypixel SkyBlock profile to calculate the total coins, purse, bank, and inventory items
            skyblockProfiles.forEach(profile => {
              if (profile.banking && profile.banking.balance) {
                totalCoins += profile.banking.balance;
                totalBank += profile.banking.balance;
              }

              if (profile.members[uuid] && profile.members[uuid].coin_purse) {
                totalCoins += profile.members[uuid].coin_purse;
                totalPurse += profile.members[uuid].coin_purse;
              }

              if (profile.members[uuid] && profile.members[uuid].inventory) {
                const inventory = profile.members[uuid].inventory;
                for (const item of inventory) {
                  if (item.tag && item.tag.display && item.tag.display.Name) {
                    const itemName = item.tag.display.Name;
                    inventoryItems.push(itemName);
                  }
                }
              }

              if (profile.banking && profile.banking.balance_coop) {
                totalCoopBank += profile.banking.balance_coop;
                totalBank += profile.banking.balance_coop;
              }
            });

            const embed = new MessageEmbed()
              .setColor('#00AA00') // You can change the color here
              .setTitle(`${username}'s Hypixel SkyBlock Balance`)
              .setDescription(`Total Coins: ${totalCoins.toLocaleString()}`)
              .addField('Purse', totalPurse.toLocaleString(), true)
              .addField('Bank', totalBank.toLocaleString(), true)
              .addField('Coop Bank', totalCoopBank.toLocaleString(), true) // Displaying the coop bank balance in the embed
              .addField('Inventory Items', inventoryItems.length > 0 ? inventoryItems.join('\n') : 'No items found')
              .setThumbnail(`https://crafatar.com/renders/head/${uuid}`)
              .setFooter('Balance data provided by Hypixel API');

            // Send the balance embed
            message.channel.send(embed);
          })
          .catch(error => {
            console.error('Error fetching Hypixel SkyBlock data:', error);
            message.channel.send('Error fetching Hypixel SkyBlock data. Please try again later.');
          });
      })
      .catch(error => {
        console.error('Error fetching player UUID:', error);
        message.channel.send('Player not found. Please check the username and try again.');
      });
  },
};
