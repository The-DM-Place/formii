const User = require('../../models/userSchema');
const ApplicationType = require('../../models/applicationTypeSchema');
const Config = require('../../models/configSchema');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: /^approve_app_(\d+)_([a-fA-F0-9-]+|moderator|pm)/,
    async execute(interaction) {
        const match = interaction.customId.match(/^approve_app_(\d+)_([a-fA-F0-9-]+|moderator|pm)/);
        if (!match) return;
        const userId = match[1];
        const appTypeId = match[2];
        const user = await User.findOne({ userId });
        const appType = await ApplicationType.findById(appTypeId);
        if (!user || !appType) return interaction.reply({ content: 'Application/user not found.', ephemeral: true });


        try {
            const member = await interaction.guild.members.fetch(userId);
            if (Array.isArray(appType.acceptedRoleIds) && appType.acceptedRoleIds.length > 0) {
                const validRoles = appType.acceptedRoleIds.filter(r => r && interaction.guild.roles.cache.has(r));
                if (validRoles.length > 0) {
                    await member.roles.add(validRoles).catch(err => {
                        console.error('Failed to add roles:', validRoles, err);
                    });
                } else {
                    console.warn('No valid roles to add for user:', userId, appType.acceptedRoleIds);
                }
            }
        } catch (err) {
            console.error('Error fetching member or adding roles:', err);
        }

        try {
            const config = await Config.getConfig(interaction.guild.id);
            if (config.resultsChannelId) {
                const resultsChannel = interaction.guild.channels.cache.get(config.resultsChannelId);
                if (resultsChannel) {
                    let msg = config.acceptedMessage || 'Congratulations! Your application has been accepted.';
                    if (msg.includes('{application_name}')) {
                        msg = msg.replace('{application_name}', appType.name);
                    }
                    await resultsChannel.send(`<@${userId}> ${msg}`);
                }
            }
        } catch { }

        const origEmbed = interaction.message.embeds[0];
        const embed = EmbedBuilder.from(origEmbed).setFooter({
            text: `Approved by: ${interaction.user.tag}`,
            iconURL: origEmbed.footer?.iconURL || undefined
        });

        await interaction.update({
            content: 'Application approved.',
            embeds: [embed],
            components: []
        });
    }
};
