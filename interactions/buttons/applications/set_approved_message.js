const Config = require('../../../models/configSchema');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'set_approved_message',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('set_approved_message_modal')
            .setTitle('Set Approved Message');
        const input = new TextInputBuilder()
            .setCustomId('approved_message')
            .setLabel('Approved Message')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};
