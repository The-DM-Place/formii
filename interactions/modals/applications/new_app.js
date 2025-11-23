const ApplicationType = require('../../../models/applicationTypeSchema');

module.exports = {
    customId: "new_application_modal",
    async execute(interaction) {
        const name = interaction.fields.getTextInputValue('app_name');
        const description = interaction.fields.getTextInputValue('app_description');

        const newApp = new ApplicationType({
            name,
            description
        });

        await newApp.save();

        await interaction.reply({ content: 'New application created!', ephemeral: true });
    }
}