const { Schema, model } = require('synz-db');

const configSchema = new Schema({
    guildId: { type: String, required: true },
    resultsChannelId: { type: String, default: null },
    applicationsChannelId: { type: String, default: null },
    adminRoleId: { type: String, default: null },
    failedMessage: { type: String, default: "We're sorry to inform you that your application has been denied. Thank you for your interest!" },
    acceptedMessage: { type: String, default: "Congratulations! Your application has been accepted. Welcome aboard!" },
    applicationsEnabled: { type: Boolean, default: false },
});

// static shit

configSchema.statics.getConfig = async function (guildId) {
    let config = await this.findOne({ guildId });
    if (!config) {
        config = await this.create({ guildId });
    }
    return config;
};

module.exports = model('Config', configSchema);
