const { connect, Model, JsonDB } = require('synz-db');

// Connect to database - this sets up the global connection
const db = connect('./data');

console.log('Database connected to: ./data');

module.exports = { connected: true, db };