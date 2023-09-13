const sqlite3 = require('sqlite3').verbose();
const config = require('../../config.json');
const dbFile = './economy.db';
const crypto = require('crypto');

const db = new sqlite3.Database(dbFile);

module.exports = {
  name: 'coinflip',
  description: 'Play a coin flip game',
  filters: ['ECONOMY'],
  aliases: ['cf'],
  execute(message, args) {
    const user = message.author.id;

    db.get('SELECT balance FROM economy WHERE user_id = ?', user, (err, row) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return;
      }

      // Check if the user data exists, if not, create it with an initial balance of 0
      if (!row) {
        db.run('INSERT INTO economy (user_id, balance) VALUES (?, ?)', user, 0, (err) => {
          if (err) {
            console.error('Error inserting new user data:', err);
            return;
          }
          startCoinflip();
        });
      } else {
        startCoinflip();
      }

      function startCoinflip() {
        const validChoices = ['h', 't', 'heads', 'tails'];
        const choice = args[0]?.toLowerCase();

        if (!choice || !validChoices.includes(choice)) {
          message.channel.send(`Invalid command usage. Use ${config.prefix}coinflip <h/t> <amount>`);
          return;
        }

        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
          message.channel.send(`Invalid amount. Use ${config.prefix}coinflip <h/t> <amount>`);
          return;
        }

        if (row.balance < amount) {
          message.channel.send('You do not have enough coins <a:j4r:1119705394839834644>.');
          return;
        }

        // Generate a cryptographically secure random number between 0 and 1
        const randomBytes = crypto.randomBytes(4);
        const randomValue = Math.abs(randomBytes.readInt32BE()) / 0x7fffffff;

        let isWin = false;
        const headsProbability = 0.6; // Adjust this probability as desired

        if (randomValue <= headsProbability && (choice === 'h' || choice === 'heads')) {
          isWin = true;
        } else if (randomValue > headsProbability && (choice === 't' || choice === 'tails')) {
          isWin = true;
        }

        if (isWin) {
          const updatedBalance = row.balance + amount;
          db.run('UPDATE economy SET balance = ? WHERE user_id = ?', updatedBalance, user, (err) => {
            if (err) {
              console.error('Error updating user data:', err);
              return;
            }
            message.channel.send(`${message.author} won ${amount} coins <a:j4r:1119705394839834644>! Your total balance is now ${updatedBalance} coins.`);
          });
        } else {
          const updatedBalance = row.balance - amount;
          db.run('UPDATE economy SET balance = ? WHERE user_id = ?', updatedBalance, user, (err) => {
            if (err) {
              console.error('Error updating user data:', err);
              return;
            }
            message.channel.send(`${message.author} lost ${amount} coins. Better luck next time! Your total balance is now ${updatedBalance} coins.`);
          });
        }
      }
    });
  },
};
