const sqlite3 = require('sqlite3').verbose();

const dbFile = './economy.db';

const db = new sqlite3.Database(dbFile);

module.exports = {
  name: 'reset',
  description: 'Reset your balance',
  filters: ['ECONOMY'],
  execute(message) {
    const user = message.author.id;

    // Check if the user data exists in the database
    db.get('SELECT balance FROM economy WHERE user_id = ?', user, (err, row) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return;
      }

      if (!row) {
        // If user data does not exist, create it with an initial balance of 0
        db.run('INSERT INTO economy (user_id, balance) VALUES (?, ?)', user, 0, (err) => {
          if (err) {
            console.error('Error inserting new user data:', err);
            return;
          }
          resetBalance();
        });
      } else {
        resetBalance();
      }
    });

    function resetBalance() {
      // Update the user's balance to 0 in the database
      db.run('UPDATE economy SET balance = 0 WHERE user_id = ?', user, (err) => {
        if (err) {
          console.error('Error resetting user balance:', err);
          return;
        }

        message.channel.send(`${message.author}, your balance has been reset.`);
      });
    }
  },
};
