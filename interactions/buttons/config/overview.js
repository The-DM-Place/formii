const renderConfigSection = require('../../../helpers/renderConfigSection');

module.exports = {
    customId: 'config_overview',
    async execute(interaction) {
        const { components } = await renderConfigSection(interaction, 'overview');
        await interaction.update({ components });
    },
};
