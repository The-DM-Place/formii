const { EmbedBuilder, MessageFlags, ButtonBuilder, ActionRowBuilder, ButtonStyle, StringSelectMenuBuilder, RoleSelectMenuBuilder } = require('discord.js');
const ApplicationType = require('../../../models/applicationTypeSchema');

module.exports = {
    customId: 'edit_applications',
    async execute(interaction) {
        const selectedAppId = interaction.values[0];
        const selectedApp = await ApplicationType.findById(selectedAppId);
        if (!selectedApp) {
            await interaction.reply({ content: 'Application not found.', ephemeral: true });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle(`Editing: ${selectedApp.name}`)
            .setDescription(selectedApp.description)
            .setColor('#00AAFF');
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

        const addQuestionButton = new ButtonBuilder()
            .setCustomId(`add_question_${selectedApp.id}`)
            .setLabel('Add Question')
            .setStyle(ButtonStyle.Secondary);

        const removeQuestionMenu = new StringSelectMenuBuilder()
            .setCustomId(`remove_question_${selectedApp.id}`)
            .setPlaceholder('Remove a question');

        if (Array.isArray(selectedApp.questions) && selectedApp.questions.length > 0) {
            removeQuestionMenu.addOptions(
                selectedApp.questions.map((q, i) => {
                    let label = q.question;
                    if (label.length > 100) label = label.slice(0, 97) + '...';
                    return {
                        label,
                        value: `remove_question_${selectedApp.id}_${i}`
                    };
                })
            );
        } else {
            removeQuestionMenu.addOptions([
                { label: 'No questions available', value: 'no_questions' }
            ]);
        }

        const editQuestionMenu = new StringSelectMenuBuilder()
            .setCustomId(`edit_question_${selectedApp.id}`)
            .setPlaceholder('Edit a question');

        if (Array.isArray(selectedApp.questions) && selectedApp.questions.length > 0) {
            editQuestionMenu.addOptions(
                selectedApp.questions.map((q, i) => {
                    let label = q.question;
                    if (label.length > 100) label = label.slice(0, 97) + '...';
                    return {
                        label,
                        value: `edit_question_${selectedApp.id}_${i}`
                    };
                })
            );
        } else {
            editQuestionMenu.addOptions([
                { label: 'No questions available', value: 'no_questions' }
            ]);
        }

        const setAcceptedRoleMenu = new RoleSelectMenuBuilder()
            .setCustomId(`set_accepted_role_${selectedApp.id}`)
            .setPlaceholder((Array.isArray(selectedApp.acceptedRoleIds) && selectedApp.acceptedRoleIds.length > 0)
                ? `Accepted Roles: ${selectedApp.acceptedRoleIds.map(rid => `<@&${rid}>`).join(', ')}`
                : 'Select Accepted Roles')
            .setMinValues(0)
            .setMaxValues(5);

        const addRow = new ActionRowBuilder().addComponents(addQuestionButton);
        const removeRow = new ActionRowBuilder().addComponents(removeQuestionMenu);
        const editRow = new ActionRowBuilder().addComponents(editQuestionMenu);
        const roleRow = new ActionRowBuilder().addComponents(setAcceptedRoleMenu);

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
            components: [removeRow, editRow, roleRow, addRow]
        });
    }
}