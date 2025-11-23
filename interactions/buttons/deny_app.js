const User = require('../../models/userSchema');
const ApplicationType = require('../../models/applicationTypeSchema');
const Config = require('../../models/configSchema');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: /^deny_app_(\d+)_([a-fA-F0-9-]+|moderator|pm)/,
    async execute(interaction) {
        const match = interaction.customId.match(/^deny_app_(\d+)_([a-fA-F0-9-]+|moderator|pm)/);
        if (!match) return;
        const userId = match[1];
        const appTypeId = match[2];
        const user = await User.findOne({ userId });
        let appType = await ApplicationType.findById(appTypeId);
        if (!appType && appTypeId === 'moderator') {
            appType = { name: 'Moderator' };
        }
        if (!user || !appType) return interaction.reply({ content: 'Application/user not found.', ephemeral: true });


        try {
            const config = await Config.getConfig(interaction.guild.id);
            if (config.resultsChannelId) {
                const resultsChannel = interaction.guild.channels.cache.get(config.resultsChannelId);
                if (resultsChannel) {
                    let msg = config.failedMessage || "We're sorry to inform you that your application has been denied.";
                    if (msg.includes('{application_name}')) {
                        msg = msg.replace('{application_name}', appType.name);
                    }
                    await resultsChannel.send(`<@${userId}> ${msg}`);
                }
            }
        } catch { }

        const origEmbed = interaction.message.embeds[0];
        const embed = EmbedBuilder.from(origEmbed).setFooter({
            text: `Denied by: ${interaction.user.tag}`,
            iconURL: origEmbed.footer?.iconURL || undefined
        });

        await interaction.update({
            content: 'Application denied.',
            embeds: [embed],
            components: []
        });
    }
};
