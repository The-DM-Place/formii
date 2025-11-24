const { EmbedBuilder, MessageFlags } = require('discord.js');
const ApplicationType = require('../../../models/applicationTypeSchema');

module.exports = {
    customId: 'view_applications',
    async execute(interaction) {
        const selectedAppId = interaction.values[0];
        const selectedApp = await ApplicationType.findById(selectedAppId);

        if (!selectedApp) {
            await interaction.reply({ content: 'Application not found.', ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(selectedApp.name)
            .setDescription(selectedApp.description)
            .setColor('#0099ff');

        if (Array.isArray(selectedApp.acceptedRoleIds) && selectedApp.acceptedRoleIds.length > 0) {
            embed.addFields({
                name: 'Accepted Roles',
                value: selectedApp.acceptedRoleIds.map(rid => `<@&${rid}>`).join(', ')
            });
        }

        if (Array.isArray(selectedApp.questions) && selectedApp.questions.length > 0) {
            embed.addFields({
                name: 'Questions',
                value: selectedApp.questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')
            });
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};