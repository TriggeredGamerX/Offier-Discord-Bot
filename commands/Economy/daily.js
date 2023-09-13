const sqlite3 = require('sqlite3').verbose();

const dbFile = './economy.db';

const db = new sqlite3.Database(dbFile);

module.exports = {
  name: 'daily',
  description: 'Claim your daily coins',
  filters: ['ECONOMY'],
  execute(message) {
    const user = message.author.id; // Discord user ID of the message author
    const cooldown = 86400000; // 24 hours in milliseconds
    const coinsPerDay = 100; // Daily coins amount

    // Check cooldown from the database
    db.get('SELECT last_claimed FROM daily_cooldown WHERE user_id = ?', user, (err, row) => {
      if (err) {
        console.error('Error fetching user cooldown data:', err);
        return;
      }

      const currentTime = Date.now();
      const lastClaimed = row ? row.last_claimed : 0;
      const timeSinceLastClaim = currentTime - lastClaimed;

      if (timeSinceLastClaim >= cooldown) {
        // Proceed with the daily claim
        db.get('SELECT balance FROM economy WHERE user_id = ?', user, (err, row) => {
          if (err) {
            console.error('Error fetching user data:', err);
            return;
          }

          if (!row) {
            // New user, insert into the database
            db.run('INSERT INTO economy (user_id, balance) VALUES (?, ?)', user, coinsPerDay, (err) => {
              if (err) {
                console.error('Error inserting new user data:', err);
                return;
              }

              message.channel.send(`${message.author}, you claimed ${coinsPerDay} daily coins! <a:j4r:1119705394839834644>`);
              // Set cooldown for new users
              db.run('INSERT INTO daily_cooldown (user_id, last_claimed) VALUES (?, ?)', user, currentTime, (err) => {
                if (err) {
                  console.error('Error inserting new user cooldown data:', err);
                }
              });
            });
          } else {
            const { balance } = row;
            const updatedBalance = balance + coinsPerDay;

            db.run('UPDATE economy SET balance = ? WHERE user_id = ?', updatedBalance, user, (err) => {
              if (err) {
                console.error('Error updating user data:', err);
                return;
              }

              message.channel.send(`${message.author}, you claimed ${coinsPerDay} daily coins! <a:j4r:1119705394839834644>`);
              // Set cooldown after successful claim
              db.run('UPDATE daily_cooldown SET last_claimed = ? WHERE user_id = ?', currentTime, user, (err) => {
                if (err) {
                  console.error('Error updating user cooldown data:', err);
                }
              });
            });
          }
        });
      } else {
        const remainingTime = cooldown - timeSinceLastClaim;
        const remainingHours = Math.floor(remainingTime / 3600000);
        const remainingMinutes = Math.floor((remainingTime % 3600000) / 60000);
        message.channel.send(
          `${message.author}, you can claim your daily coins again in ${remainingHours} hours and ${remainingMinutes} minutes.`
        );
      }
    });
  },
};
