const Config = require('../../../models/configSchema');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'set_rejected_message',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('set_rejected_message_modal')
            .setTitle('Set Rejected Message');
        const input = new TextInputBuilder()
            .setCustomId('rejected_message')
            .setLabel('Rejected Message')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};
