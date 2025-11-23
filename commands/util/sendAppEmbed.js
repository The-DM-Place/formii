const { EmbedBuilder, StringSelectMenuBuilder, SlashCommandBuilder, MessageFlags, PermissionFlagsBits, ActionRowBuilder } = require('discord.js');
const ApplicationType = require('../../models/applicationTypeSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-apps-embed')
        .setDescription('Sends or updates the application embed in a specified channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send or update the embed in.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('If provided, refresh the embed with this message ID instead of sending a new one.')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const messageId = interaction.options.getString('message_id');
        if (!channel || !channel.isTextBased()) {
            await interaction.reply({ content: 'Please specify a valid text channel.', ephemeral: true });
            return;
        }
        const appTypes = await ApplicationType.find({ enabled: true });
        if (appTypes.length === 0) {
            await interaction.reply({ content: 'No enabled application types found. Please create and enable application types first.', ephemeral: true });
            return;
        }

        const applicationMenu = new StringSelectMenuBuilder()
            .setCustomId('start_application')
            .setPlaceholder('Start an application')
            .setMinValues(1)
            .setMaxValues(1);
        applicationMenu.addOptions(
            appTypes.map(app => {
                let label = app.name;
                if (label.length > 100) label = label.slice(0, 97) + '...';
                let description = app.description || 'No description';
                return {
                    label,
                    value: app.id,
                    description
                };
            })
        );
        const embed = new EmbedBuilder()
            .setTitle('Application Information & Rules')
            .setColor(0x5865F2)
            .setDescription(
                '**Moderators**\n'
                + 'The moderators help keep the server and community safe, they also enforce rules to ensure the server stays friendly and welcoming.\n'
                + '**Requirements**\n'
                + '<a:4warrow:1229420261720461333> Must be at least 15 years of age\n'
                + '<a:4warrow:1229420261720461333> Must have at least level 5\n'
                + '<a:4warrow:1229420261720461333> Must be in the server for more than 2 weeks\n'
                + '<a:4warrow:1229420261720461333> Must have at least 500 messages in chat or if you do not use the chat you must have at least 30 posts in the dm channels\n'
                + '<a:4warrow:1229420261720461333> Must have 2 factor Authentication turned on\n'
                + '<a:4warrow:1229420261720461333> Must have no more than 2 warnings\n\n'
                + '**Partner managers**\n'
                + 'A partner managers job is to receive and send offers for server partnership and manage server partnerships. A server partnership is when 2 servers advertise each other in specific channels\n'
                + '**Requirements**\n'
                + '<a:4warrow:1229420261720461333> Must be at least 14 years of age\n'
                + '<a:4warrow:1229420261720461333> Must know the terms "massing" and "portal", if you do not know these terms than you cannot become a partner manager\n\n'
                + '**Event host**\n'
                + 'An event hosts job is to manage/host server events for the community\n'
                + '**Requirements**\n'
                + '<a:4warrow:1229420261720461333> Must be at least 14 years of age\n'
                + '<a:4warrow:1229420261720461333> Must have at least 2,000 messages in the server chat\n\n'
                + '**Information and application rules**\n'
                + '**Application rules**\n'
                + '<a:4warrow:1229420261720461333> Must not ping the owner, co owner, head admin, admins or mods about the application.\n'
                + '<a:4warrow:1229420261720461333> Must not put in "fill in" sentences or spam a singular character to bypass the minimum character requirement as it defeats the whole purpose of it, so if you cant type in at least 250 characters you are not getting in.\n'
                + '<a:4warrow:1229420261720461333> Must not lie or do something fraudulent with the application. the moment we discover something is fraudulent or isn\'t truthful we will ban you for fraud.\n'
                + '<a:4warrow:1229420261720461333> By filling out the application you agree to having your results posted publicly.\n\n'
                + '**Common reasons why applications get rejected**\n'
                + '<a:4warrow:1229420261720461333> Spelling errors\n'
                + '<a:4warrow:1229420261720461333> Not meeting the minimum level/message requirements\n'
                + '<a:4warrow:1229420261720461333> Getting most or all of the quiz answers wrong'
            );

        if (messageId) {
            try {
                const msg = await channel.messages.fetch(messageId);
                await msg.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(applicationMenu)] });
                await interaction.reply({ content: `Application embed updated in ${channel}.`, ephemeral: true });
            } catch (err) {
                await interaction.reply({ content: `Could not update message. Make sure the message ID is correct and the bot can access it.`, ephemeral: true });
            }
        } else {
            await channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(applicationMenu)] });
            await interaction.reply({ content: `Application embed sent to ${channel}.`, ephemeral: true });
        }
    }
}
