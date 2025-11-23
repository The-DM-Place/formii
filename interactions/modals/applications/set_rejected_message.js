const Config = require('../../../models/configSchema');

module.exports = {
    customId: 'set_rejected_message_modal',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const config = await Config.getConfig(guildId);
        const message = interaction.fields.getTextInputValue('rejected_message');
        config.failedMessage = message;
        await config.save();
        await interaction.reply({ content: 'Rejected message updated!', flags: 64 });
    }
};
