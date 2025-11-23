const Config = require('../../../models/configSchema');

module.exports = {
    customId: 'set_approved_message_modal',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const config = await Config.getConfig(guildId);
        const message = interaction.fields.getTextInputValue('approved_message');
        config.acceptedMessage = message;
        await config.save();
        await interaction.reply({ content: 'Approved message updated!', flags: 64 });
    }
};
