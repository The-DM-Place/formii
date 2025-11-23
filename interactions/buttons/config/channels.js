const renderConfigSection = require('../../../helpers/renderConfigSection');

module.exports = {
    customId: 'config_channels',
    async execute(interaction) {
        const { components } = await renderConfigSection(interaction, 'channels');
        await interaction.update({ components });
    },
};
