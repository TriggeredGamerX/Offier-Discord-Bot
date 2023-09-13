const sqlite3 = require('sqlite3').verbose();
const config = require('../../config.json');
const dbFile = './economy.db';

const db = new sqlite3.Database(dbFile);

module.exports = {
  name: 'gamble',
  description: 'Gamble your coins',
  filters: ['ECONOMY'],
  execute(message, args) {
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      message.channel.send(`Invalid command usage. Use ${config.prefix}gamble <amount>`);
      return;
    }

    const user = message.author.id;

    // Check if the user data exists in the database, if not, create it with an initial balance of 0
    db.get('SELECT balance FROM economy WHERE user_id = ?', user, (err, row) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return;
      }

      if (!row) {
        db.run('INSERT INTO economy (user_id, balance) VALUES (?, ?)', user, 0, (err) => {
          if (err) {
            console.error('Error inserting new user data:', err);
            return;
          }
          performGambling();
        });
      } else {
        performGambling();
      }
    });

    function performGambling() {
      db.get('SELECT balance FROM economy WHERE user_id = ?', user, (err, row) => {
        if (err) {
          console.error('Error fetching user data:', err);
          return;
        }

        if (!row || row.balance < amount) {
          message.channel.send('You do not have enough coins <a:j4r:1119705394839834644>.');
          return;
        }

        const chance = Math.random();
        if (chance < 0.5) {
          db.run('UPDATE economy SET balance = balance - ? WHERE user_id = ?', amount, user, (err) => {
            if (err) {
              console.error('Error updating user data:', err);
              return;
            }
            message.channel.send(`${message.author} lost ${amount} coins. Better luck next time!`);
          });
        } else {
          db.run('UPDATE economy SET balance = balance + ? WHERE user_id = ?', amount, user, (err) => {
            if (err) {
              console.error('Error updating user data:', err);
              return;
            }
            message.channel.send(`${message.author} won ${amount} coins <a:j4r:1119705394839834644>!`);
          });
        }
      });
    }
  },
};
