const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const renderConfigSection = require('../../helpers/renderConfigSection');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Opens the configuration panel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    const { components } = await renderConfigSection(interaction);

    await interaction.reply({
      components,
      flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  },
};
