const renderConfigSection = require('../../../helpers/renderConfigSection');

module.exports = {
    customId: 'config_applications',
    async execute(interaction) {
        const { components } = await renderConfigSection(interaction, 'applications');
        await interaction.update({ components });
    },
};
