const User = require('../../models/userSchema');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-apps')
        .setDescription('Set canApply to true for all users and all application types.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const users = await User.find({});
        let updated = 0;
        for (const user of users) {
            if (user.canApply) {
                for (const key of Object.keys(user.canApply)) {
                    user.canApply[key] = true;
                }
                await user.save();
                updated++;
            }
        }
        await interaction.reply({ content: `canApply set to true for all users (${updated} updated).`, ephemeral: true });
    }
};
