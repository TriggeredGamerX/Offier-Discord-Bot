const sqlite3 = require('sqlite3').verbose();

const dbFile = './economy.db';
const config = require('../../config.json');
const db = new sqlite3.Database(dbFile);

// Create the economy table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS economy (
    user_id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 0,
    last_claimed INTEGER
  )
`, (err) => {
  if (err) {
    console.error('Error creating economy table:', err);
  } else {
    console.log('Economy table created successfully.');
  }
});

// Create the daily_cooldown table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS daily_cooldown (
    user_id TEXT,
    last_claimed INTEGER
  )
`, (err) => {
  if (err) {
    console.error('Error creating daily_cooldown table:', err);
  } else {
    console.log('Daily cooldown table created successfully.');
  }
});

// Close the database connection when your bot is shutting down
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database connection:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit();
  });
});
