const ApplicationType = require('../../../models/applicationTypeSchema');

module.exports = {
    customId: 'delete_applications',
    async execute(interaction) {
        const selectedIds = interaction.values;
        if (!selectedIds || selectedIds.length === 0) {
            await interaction.reply({ content: 'No applications selected.', flags: 64 });
            return;
        }
        let deleted = 0;
        for (const id of selectedIds) {
            const app = await ApplicationType.findById(id);
            if (app) {
                await app.deleteOne();
                deleted++;
            }
        }
        await interaction.reply({ content: `Deleted ${deleted} application(s).`, flags: 64 });
    }
};
