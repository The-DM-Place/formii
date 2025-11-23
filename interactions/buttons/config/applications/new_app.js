const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'create_new_application',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('new_application_modal')
            .setTitle('Create New Application');

        const nameInput = new TextInputBuilder()
            .setCustomId('app_name')
            .setLabel('Application Name')
            .setPlaceholder('e.g., "Moderator Application"')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('app_description')
            .setLabel('Application Description')
            .setPlaceholder('Briefly describe the purpose of this application')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const { ActionRowBuilder } = require('discord.js');
        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);
    },
};
