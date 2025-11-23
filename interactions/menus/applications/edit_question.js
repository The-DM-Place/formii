const ApplicationType = require('../../../models/applicationTypeSchema');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: /^edit_question_/,
    async execute(interaction) {
        const value = interaction.values[0];
        const match = value.match(/^edit_question_(.+)_(\d+)$/);
        if (!match) {
            await interaction.reply({ content: 'Invalid selection.', ephemeral: true });
            return;
        }
        const appId = match[1];
        const questionIndex = parseInt(match[2], 10);
        const app = await ApplicationType.findById(appId);
        if (!app) {
            await interaction.reply({ content: 'Application type not found.', ephemeral: true });
            return;
        }
        if (!Array.isArray(app.questions) || questionIndex < 0 || questionIndex >= app.questions.length) {
            await interaction.reply({ content: 'Invalid question index.', ephemeral: true });
            return;
        }

        const question = app.questions[questionIndex];
        const isMultiple = question.type === 'multiple';

        const modal = new ModalBuilder()
            .setCustomId(`edit_question_modal_${appId}_${questionIndex}`)
            .setTitle(`Edit Question for ${app.name}`);

        const questionInput = new TextInputBuilder()
            .setCustomId('question_text')
            .setLabel('Question')
            .setPlaceholder('Edit the question')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setValue(question.question);

        if (isMultiple) {
            const optionsInput = new TextInputBuilder()
                .setCustomId('options')
                .setLabel('Options (comma separated)')
                .setPlaceholder('Option 1, Option 2, Option 3')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setValue(question.options?.join(', ') || '');

            const limitInput = new TextInputBuilder()
                .setCustomId('limit')
                .setLabel('Max selections allowed')
                .setPlaceholder('1')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(String(question.limit || 1));

            const extraInfoInput = new TextInputBuilder()
                .setCustomId('extra_info')
                .setLabel('Extra Information (optional)')
                .setPlaceholder('Additional context for the question')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setValue(question.extraInfo || '');

            modal.addComponents(
                new ActionRowBuilder().addComponents(questionInput),
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
                .setRequired(false)
                .setValue(String(question.minChars || 0));

            modal.addComponents(
                new ActionRowBuilder().addComponents(questionInput),
                new ActionRowBuilder().addComponents(minCharsInput)
            );
        }

        await interaction.showModal(modal);
    }
};
