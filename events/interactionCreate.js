const { Events } = require('discord.js');
const { handleButtonInteraction } = require('../handlers/buttonHandler');
const { handleModalInteraction } = require('../handlers/modalHandler');
const { handleSelectMenuInteraction } = require('../handlers/selectMenuHandler');
const logger = require('../utils/logger');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		logger.info(`Interaction received: Type=${interaction.type}, CustomId=${interaction.customId || 'N/A'}, User=${interaction.user.tag}`);

		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(
				interaction.commandName
			);

			if (!command) {
				logger.warn(
					`No command matching ${interaction.commandName} was found.`
				);
				return;
			}

			try {
				await command.execute(interaction);
				logger.info(
					`Command executed: ${interaction.commandName} by ${interaction.user.tag}`
				);
			} catch (error) {
				logger.error(
					`Error executing command ${interaction.commandName}:`,
					error
				);

				const errorMessage =
					'There was an error while executing this command!';

				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content: errorMessage,
						ephemeral: true,
					});
				} else {
					await interaction.reply({
						content: errorMessage,
						ephemeral: true,
					});
				}
			}
		}
		else if (interaction.isButton()) {
			logger.info(`Button interaction detected: ${interaction.customId}`);
			await handleButtonInteraction(interaction);
		}
		else if (interaction.isAnySelectMenu?.() || interaction.isStringSelectMenu() || interaction.isRoleSelectMenu?.() || interaction.isChannelSelectMenu?.() || interaction.isMentionableSelectMenu?.() || interaction.isUserSelectMenu?.()) {
			logger.info(`Select menu interaction detected: ${interaction.customId}, Type: ${interaction.componentType}`);
			await handleSelectMenuInteraction(interaction);
		}
		else if (interaction.isModalSubmit()) {
			logger.info(`Modal interaction detected: ${interaction.customId}`);
			await handleModalInteraction(interaction);
		}
		else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(
				interaction.commandName
			);

			if (!command || !command.autocomplete) {
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				logger.error(
					`Error executing autocomplete for ${interaction.commandName}:`,
					error
				);
			}
		}
		else {
			logger.warn(`Unhandled interaction type: ${interaction.type}, CustomId: ${interaction.customId || 'N/A'}`);
		}
	},
};
