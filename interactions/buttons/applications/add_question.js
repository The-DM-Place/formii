const ApplicationType = require('../../../models/applicationTypeSchema');
const { StringSelectMenuBuilder, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
    customId: /^add_question_/,
    async execute(interaction) {
        const match = interaction.customId.match(/^add_question_(.+)$/);
        if (!match) {
            await interaction.reply({ content: 'Invalid button interaction.', ephemeral: true });
            return;
        }
        const appId = match[1];
        const app = await ApplicationType.findById(appId);
        if (!app) {
            await interaction.reply({ content: 'Application type not found.', ephemeral: true });
            return;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_question_type_${appId}`)
            .setPlaceholder('Select question type')
            .addOptions([
                {
                    label: 'Text Question',
                    description: 'A question that requires a text answer',
                    value: 'text'
                },
                {
                    label: 'Multiple Choice Question',
                    description: 'A question with multiple options to select from',
                    value: 'multiple'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'What type of question would you like to add?',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
};
