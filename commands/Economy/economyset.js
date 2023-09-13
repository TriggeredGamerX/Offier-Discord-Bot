const sqlite3 = require('sqlite3').verbose();
const config = require('../../config.json');
const dbFile = './economy.db';

const db = new sqlite3.Database(dbFile);

const allowedUserIDs = [1118784796198453309, 938705645128003585, 1089100266076389468];

module.exports = {
  name: 'seteco',
  description: 'Set user economy balance (Admin use only)',
  filters: ['ECONOMY','ADMIN'],
  aliases: ['set'],
  execute(message, args) {
    const botOwnerId = '1118784796198453309'; // Replace with your bot's owner ID
    if (message.author.id !== botOwnerId) {
      message.channel.send('You are not authorized to use this command.');
      return;
    }

    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || isNaN(amount)) {
      message.channel.send('Invalid command usage. Use !economyset @user <amount>');
      return;
    }

    db.get('SELECT balance FROM economy WHERE user_id = ?', user.id, (err, row) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return;
      }

      if (!row) {
        db.run('INSERT INTO economy (user_id, balance) VALUES (?, ?)', user.id, amount, (err) => {
          if (err) {
            console.error('Error inserting new user data:', err);
            return;
          }
          message.channel.send(`${user} economy balance set to ${amount} coins.`);
        });
      } else {
        db.run('UPDATE economy SET balance = ? WHERE user_id = ?', amount, user.id, (err) => {
          if (err) {
            console.error('Error updating user data:', err);
            return;
          }
          message.channel.send(`${user} economy balance set to ${amount} coins.`);
        });
      }
    });
  },
};
