const ApplicationType = require('../../../models/applicationTypeSchema');

module.exports = {
    customId: 'toggle_application_type',
    async execute(interaction) {
        const typeId = interaction.values[0];
        const appType = await ApplicationType.findById(typeId);
        if (!appType) {
            await interaction.reply({ content: 'Application type not found.', ephemeral: true });
            return;
        }
        appType.enabled = !appType.enabled;
        await appType.save();
        await interaction.reply({ content: `Application type **${appType.name}** is now **${appType.enabled ? 'enabled' : 'disabled'}**.`, ephemeral: true });
    }
}
