const ApplicationType = require('../../../models/applicationTypeSchema');
const Config = require('../../../models/configSchema');
const User = require('../../../models/userSchema');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');

module.exports = {
    customId: /^mod_app_q\d+$|start_application/,
    async execute(interaction) {
        if (interaction.customId && /^mod_app_q\d+$/.test(interaction.customId)) {
            return;
        }

        const appTypeId = interaction.values[0] || interaction.customId;
        const userId = interaction.user.id;

        const guildConfig = await Config.getConfig(interaction.guild.id);
        if (!guildConfig.applicationsEnabled) {
            return interaction.reply({ content: 'Applications are currently disabled.', ephemeral: true });
        }

        const appType = await ApplicationType.findById(appTypeId);
        if (!appType || !appType.enabled) {
            return interaction.reply({ content: 'This application type is not available.', ephemeral: true });
        }

        let user = await User.findOne({ userId });
        if (!user) user = await User.create({ userId });
        if (user.canApply && user.canApply[appTypeId] === false) {
            return interaction.reply({ content: 'You are not eligible to apply for this application type.', ephemeral: true });
        }

        let dm;
        let dmMsg;
        try {
            dm = await interaction.user.createDM();
            const confirmEmbed = new EmbedBuilder()
                .setTitle('Start Application')
                .setDescription(`You are about to start the **${appType.name}** application.\n\nAre you sure you want to begin? You will have 25 minutes to complete all questions.`)
                .setColor(0x5865F2);
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('start_app_confirm').setLabel('Start').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('start_app_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger)
            );
            dmMsg = await dm.send({ embeds: [confirmEmbed], components: [row] });
            await interaction.reply({ content: 'Check your DMs to confirm starting the application.', ephemeral: true });
        } catch (err) {
            return interaction.reply({ content: 'Could not DM you. Please check your privacy settings and ensure you allow direct messages from server members.', ephemeral: true });
        }

        let confirmed = false;
        try {
            const filter = i => i.user.id === userId && ['start_app_confirm', 'start_app_cancel'].includes(i.customId);
            const collected = await dmMsg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 5 * 60 * 1000 });
            if (collected.customId === 'start_app_cancel') {
                await collected.update({ content: 'Application cancelled.', embeds: [], components: [] });
                return;
            }
            await collected.update({ content: 'Application started! Please answer the following questions.', embeds: [], components: [] });
            confirmed = true;
        } catch (err) {
            await dmMsg.edit({ content: 'No response. Application cancelled.', embeds: [], components: [] });
            return;
        }
        if (!confirmed) return;

        const questions = (appType.questions || []).map(q => ({
            type: q.type || 'text',
            question: q.question,
            minLength: q.minChars || 0,
            options: q.options || [],
            limit: q.limit || 1,
            extraInfo: q.extraInfo || ''
        }));
        if (questions.length === 0) {
            await dm.send('No questions are set for this application type.');
            return;
        }
        const answers = [];
        let timedOut = false;
        const startTime = Date.now();
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (q.type === 'text') {
                const qEmbed = new EmbedBuilder()
                    .setTitle(`Question ${i + 1}`)
                    .setDescription(q.question)
                    .setColor(0x5865F2);
                await dm.send({ embeds: [qEmbed] });
                const timeLeft = 25 * 60 * 1000 - (Date.now() - startTime);
                if (timeLeft <= 0) { timedOut = true; break; }
                let answer = null;
                while (true) {
                    const collected = await dm.awaitMessages({
                        filter: m => m.author.id === userId,
                        max: 1,
                        time: timeLeft,
                        errors: ['time']
                    }).catch(() => null);
                    if (!collected || collected.size === 0) { timedOut = true; break; }
                    answer = collected.first().content;
                    if (q.minLength && answer.length < q.minLength) {
                        await dm.send(`Your answer must be at least ${q.minLength} characters. Please try again.`);
                        continue;
                    }
                    break;
                }
                if (timedOut) break;
                answers.push(answer);
            } else if (q.type === 'multiple') {
                const { StringSelectMenuBuilder } = require('discord.js');
                const select = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`mod_app_q${i}`)
                        .setPlaceholder('Select your answer(s)')
                        .addOptions(q.options.map((opt, idx) => ({ label: opt, value: String(idx) })))
                        .setMinValues(1)
                        .setMaxValues(q.limit)
                );
                let description = q.question;
                if (q.extraInfo) {
                    description += '\n\n' + q.extraInfo;
                }
                const qEmbed = new EmbedBuilder()
                    .setTitle(`Question ${i + 1}`)
                    .setDescription(description)
                    .setColor(0x5865F2);
                const msg = await dm.send({ embeds: [qEmbed], components: [select] });
                const timeLeft = 25 * 60 * 1000 - (Date.now() - startTime);
                if (timeLeft <= 0) { timedOut = true; break; }
                let selection;
                try {
                    const collected = await msg.awaitMessageComponent({
                        filter: comp => comp.user.id === userId && comp.customId === `mod_app_q${i}`,
                        componentType: ComponentType.StringSelect,
                        time: timeLeft
                    });
                    await collected.update({ content: 'Answer received.', embeds: [], components: [] });
                    selection = collected.values.map(idx => q.options[Number(idx)]);
                } catch {
                    timedOut = true;
                    break;
                }
                answers.push(selection);
            }
        }
        if (timedOut) {
            await dm.send('You took too long to answer. The application has timed out.');
            return;
        }

        await dm.send('Thank you for completing the application! Your answers have been submitted.');
        user.canApply = user.canApply || {};
        user.canApply[appTypeId] = false;
        await user.save();

        const guild = interaction.guild;
        const config = await Config.getConfig(guild.id);
        if (!config.applicationsChannelId) return;
        const applicationsChannel = guild.channels.cache.get(config.applicationsChannelId);
        if (!applicationsChannel) return;

        const answerFields = [];
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            let value = Array.isArray(answers[i]) ? answers[i].join(', ') : (answers[i] || '*No answer*');
            const baseName = `Q${i + 1}: ${typeof q === 'object' && q.question ? q.question : q}`;
            if (typeof value === 'string' && value.length > 1024) {
                let chunkIndex = 0;
                while (value.length > 0) {
                    const chunk = value.slice(0, 1024);
                    value = value.slice(1024);
                    answerFields.push({
                        name: chunkIndex === 0 ? baseName : `${baseName} (cont. ${chunkIndex + 1})`,
                        value: chunk,
                        inline: false
                    });
                    chunkIndex++;
                }
            } else {
                answerFields.push({
                    name: baseName,
                    value,
                    inline: false
                });
            }
        }
        const timeTakenMs = Date.now() - startTime;
        const minutes = Math.floor(timeTakenMs / 60000);
        const seconds = Math.floor((timeTakenMs % 60000) / 1000);
        const timeTakenStr = `${minutes}m ${seconds}s`;

        const reviewEmbed = new EmbedBuilder()
            .setTitle(`New Application: ${appType.name}`)
            .setDescription(`Submitted by <@${userId}>`)
            .setColor(0x5865F2)
            .addFields(answerFields)
            .setFooter({ text: `Time to complete: ${timeTakenStr}` });
        const reviewRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`approve_app_${userId}_${appTypeId}`).setLabel('Approve').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`deny_app_${userId}_${appTypeId}`).setLabel('Deny').setStyle(ButtonStyle.Danger),
        );
        await applicationsChannel.send({ embeds: [reviewEmbed], components: [reviewRow] });
    }
};
