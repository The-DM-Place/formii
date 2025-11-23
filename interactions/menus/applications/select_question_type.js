const ApplicationType = require('../../../models/applicationTypeSchema');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: /^select_question_type_/,
    async execute(interaction) {
        const match = interaction.customId.match(/^select_question_type_(.+)$/);
        if (!match) {
            await interaction.reply({ content: 'Invalid selection.', ephemeral: true });
            return;
        }
        const appId = match[1];
        const questionType = interaction.values[0];

        const app = await ApplicationType.findById(appId);
        if (!app) {
            await interaction.reply({ content: 'Application type not found.', ephemeral: true });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId(`add_question_modal_${appId}_${questionType}`)
            .setTitle(`Add ${questionType === 'multiple' ? 'Multiple Choice' : 'Text'} Question`);

        const questionInput = new TextInputBuilder()
            .setCustomId('question_text')
            .setLabel('Question')
            .setPlaceholder('Enter the question')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(questionInput));

        if (questionType === 'multiple') {
            const optionsInput = new TextInputBuilder()
                .setCustomId('options')
                .setLabel('Options (comma separated)')
                .setPlaceholder('Option 1, Option 2, Option 3')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const limitInput = new TextInputBuilder()
                .setCustomId('limit')
                .setLabel('Max selections allowed')
                .setPlaceholder('1')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const extraInfoInput = new TextInputBuilder()
                .setCustomId('extra_info')
                .setLabel('Extra Information (optional)')
                .setPlaceholder('Additional context')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(optionsInput),
                new ActionRowBuilder().addComponents(limitInput),
                new ActionRowBuilder().addComponents(extraInfoInput)
            );
        } else {
            const minCharsInput = new TextInputBuilder()
                .setCustomId('min_chars')
                .setLabel('Minimum Characters')
                .setPlaceholder('0')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(new ActionRowBuilder().addComponents(minCharsInput));
        }

        await interaction.showModal(modal);
    }
};