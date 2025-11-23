const ApplicationType = require('../../../models/applicationTypeSchema');

module.exports = {
    customId: /^add_question_modal_/,
    async execute(interaction) {
        const match = interaction.customId.match(/^add_question_modal_(.+)_(.+)$/);
        if (!match) {
            await interaction.reply({ content: 'Invalid modal interaction.', ephemeral: true });
            return;
        }
        const appId = match[1];
        const questionType = match[2];

        const questionText = interaction.fields.getTextInputValue('question_text');
        if (!questionText || !questionText.trim()) {
            await interaction.reply({ content: 'Question cannot be empty.', ephemeral: true });
            return;
        }

        const app = await ApplicationType.findById(appId);
        if (!app) {
            await interaction.reply({ content: 'Application type not found.', ephemeral: true });
            return;
        }

        const newQuestion = {
            question: questionText.trim(),
            type: questionType
        };

        if (questionType === 'multiple') {
            const optionsRaw = interaction.fields.getTextInputValue('options');
            const limitRaw = interaction.fields.getTextInputValue('limit') || '1';
            const extraInfo = interaction.fields.getTextInputValue('extra_info') || '';

            newQuestion.options = optionsRaw.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
            newQuestion.limit = parseInt(limitRaw, 10) || 1;
            newQuestion.extraInfo = extraInfo.trim();

            if (newQuestion.options.length === 0) {
                await interaction.reply({ content: 'Multiple choice questions must have at least one option.', ephemeral: true });
                return;
            }
        } else {
            const minCharsRaw = interaction.fields.getTextInputValue('min_chars') || '0';
            newQuestion.minChars = parseInt(minCharsRaw, 10) || 0;
        }

        app.questions.push(newQuestion);
        await app.save();

        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags, RoleSelectMenuBuilder } = require('discord.js');
        const embed = new EmbedBuilder()
            .setTitle(`Editing: ${app.name}`)
            .setDescription(app.description)
            .setColor('#00AAFF');

        if (Array.isArray(app.acceptedRoleIds) && app.acceptedRoleIds.length > 0) {
            embed.addFields({
                name: 'Accepted Roles',
                value: app.acceptedRoleIds.map(rid => `<@&${rid}>`).join(', ')
            });
        }

        if (Array.isArray(app.questions) && app.questions.length > 0) {
            embed.addFields({
                name: 'Questions',
                value: app.questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')
            });
        }

        const addQuestionButton = new ButtonBuilder()
            .setCustomId(`add_question_${app.id}`)
            .setLabel('Add Question')
            .setStyle(ButtonStyle.Secondary);

        const removeQuestionMenu = new StringSelectMenuBuilder()
            .setCustomId(`remove_question_${app.id}`)
            .setPlaceholder('Remove a question');
        if (Array.isArray(app.questions) && app.questions.length > 0) {
            removeQuestionMenu.addOptions(
                app.questions.map((q, i) => {
                    let label = q.question;
                    if (label.length > 100) label = label.slice(0, 97) + '...';
                    return {
                        label,
                        value: `remove_question_${app.id}_${i}`
                    };
                })
            );
        } else {
            removeQuestionMenu.addOptions([
                { label: 'No questions available', value: 'no_questions' }
            ]);
        }

        const editQuestionMenu = new StringSelectMenuBuilder()
            .setCustomId(`edit_question_${app.id}`)
            .setPlaceholder('Edit a question');
        if (Array.isArray(app.questions) && app.questions.length > 0) {
            editQuestionMenu.addOptions(
                app.questions.map((q, i) => {
                    let label = q.question;
                    if (label.length > 100) label = label.slice(0, 97) + '...';
                    return {
                        label,
                        value: `edit_question_${app.id}_${i}`
                    };
                })
            );
        } else {
            editQuestionMenu.addOptions([
                { label: 'No questions available', value: 'no_questions' }
            ]);
        }

        const setAcceptedRoleMenu = new RoleSelectMenuBuilder()
            .setCustomId(`set_accepted_role_${app.id}`)
            .setPlaceholder((Array.isArray(app.acceptedRoleIds) && app.acceptedRoleIds.length > 0)
                ? `Accepted Roles: ${app.acceptedRoleIds.map(rid => `<@&${rid}>`).join(', ')}`
                : 'Select Accepted Roles')
            .setMinValues(0)
            .setMaxValues(5);

        const roleRow = new ActionRowBuilder().addComponents(setAcceptedRoleMenu);
        const addRow = new ActionRowBuilder().addComponents(addQuestionButton);
        const removeRow = new ActionRowBuilder().addComponents(removeQuestionMenu);
        const editRow = new ActionRowBuilder().addComponents(editQuestionMenu);

        await interaction.update({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
            components: [removeRow, editRow, roleRow, addRow]
        });
    }
};
