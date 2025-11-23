const Config = require('../../../models/configSchema');

module.exports = {
    customId: 'select_admin_role',
    async execute(interaction) {
        const roleId = interaction.values[0];
        const guildId = interaction.guild.id;
        const config = await Config.getConfig(guildId);
        config.adminRoleId = roleId;
        await config.save();
        await interaction.reply({ content: `Admin role set to <@&${roleId}>.`, flags: 64 });
    }
};
