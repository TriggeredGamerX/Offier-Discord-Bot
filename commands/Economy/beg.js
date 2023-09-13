const sqlite3 = require('sqlite3').verbose();

const dbFile = './economy.db';
const config = require('../../config.json');
const db = new sqlite3.Database(dbFile);

// Cooldown Map to keep track of the last time users used the !beg command
const begCooldown = new Map();

module.exports = {
  name: 'beg',
  description: 'Beg for coins',
  filters: ['ECONOMY'],
  execute(message) {
    const user = message.author.id;
    const cooldownTime = 3600000; // 1 hour in milliseconds
    const currentTime = Date.now();

    if (begCooldown.has(user)) {
      const remainingTime = cooldownTime - (currentTime - begCooldown.get(user));
      const remainingHours = Math.floor(remainingTime / 3600000);
      const remainingMinutes = Math.floor((remainingTime % 3600000) / 60000);
      message.channel.send(
        `${message.author}, you can beg again in ${remainingHours} hours and ${remainingMinutes} minutes.`
      );
      return;
    }

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
          giveCoins();
        });
      } else {
        giveCoins();
      }
    });

    function giveCoins() {
      const begAmount = Math.floor(Math.random() * 50) + 1; // Random amount between 1 and 50

      db.run('UPDATE economy SET balance = balance + ? WHERE user_id = ?', begAmount, user, (err) => {
        if (err) {
          console.error('Error updating user data:', err);
          return;
        }

        message.channel.send(`${message.author}, someone felt generous and gave you ${begAmount} coins <a:j4r:1119705394839834644>!`);

        // Set the cooldown for the user
        begCooldown.set(user, currentTime);
        setTimeout(() => begCooldown.delete(user), cooldownTime);
      });
    }
  },
};
