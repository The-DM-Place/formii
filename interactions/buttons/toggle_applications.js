const Config = require('../../models/configSchema');
const renderConfigSection = require('../../helpers/renderConfigSection');

module.exports = {
    customId: 'toggle_applications',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const config = await Config.getConfig(guildId);
        config.applicationsEnabled = !config.applicationsEnabled;
        await config.save();

        const { components } = await renderConfigSection(interaction);
        await interaction.update({ components });
    }
};
