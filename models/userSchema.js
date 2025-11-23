const { Schema, model } = require('synz-db');

const userSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    canApply: { type: Object, default: {} },
    lastApplicationDate: { type: Date, default: null },
    applications: { type: Array, default: [] },
});

module.exports = model('User', userSchema);
