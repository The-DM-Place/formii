const Config = require('../../../models/configSchema');

module.exports = {
    customId: 'select_applications_channel',
    async execute(interaction) {
        const channelId = interaction.values[0];
        const guildId = interaction.guild.id;
        const config = await Config.getConfig(guildId);
        config.applicationsChannelId = channelId;
        await config.save();
        await interaction.reply({ content: `Applications channel set to <#${channelId}>.`, flags: 64 });
    }
};
