const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

async function getAllJsFiles(dir) {
	const dirents = await fs.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map((dirent) => {
			const res = path.resolve(dir, dirent.name);
			if (dirent.isDirectory()) {
				return getAllJsFiles(res);
			} else if (dirent.isFile() && res.endsWith('.js')) {
				return res;
			}
			return [];
		})
	);
	return Array.prototype.concat(...files);
}

async function loadButtons(client) {
	const buttonsPath = path.join(__dirname, '..', 'interactions', 'buttons');

	try {
		await fs.access(buttonsPath);

		const jsFiles = await getAllJsFiles(buttonsPath);

		logger.info(`Found ${jsFiles.length} button handler files`);

		for (const filePath of jsFiles) {
			const file = path.basename(filePath);

			try {
				delete require.cache[require.resolve(filePath)];

				const button = require(filePath);

				if (!button.customId || !button.execute) {
					logger.warn(
						`Button file ${file} is missing required properties (customId or execute)`
					);
					continue;
				}

				client.buttons.set(button.customId, button);

				logger.success(`Loaded button: ${button.customId} (${file})`);
			} catch (error) {
				logger.error(`Error loading button from ${file}:`, error);
			}
		}
	} catch (error) {
		if (error.code === 'ENOENT') {
			logger.warn('Buttons directory not found, creating it...');
			await fs.mkdir(buttonsPath, { recursive: true });
		} else {
			logger.error('Error loading buttons:', error);
		}
	}
}

async function handleButtonInteraction(interaction) {
	let button = interaction.client.buttons.get(interaction.customId);

	if (!button) {
		for (const [key, buttonHandler] of interaction.client.buttons) {
			if (
				buttonHandler.customId instanceof RegExp &&
				buttonHandler.customId.test(interaction.customId)
			) {
				button = buttonHandler;
				break;
			}
		}
	}

	if (!button) {
		logger.warn(
			`No button handler found for customId: ${interaction.customId}`
		);
		return;
	}

	try {
		await button.execute(interaction);
		logger.info(
			`Button executed: ${interaction.customId} by ${interaction.user.tag}`
		);
	} catch (error) {
		logger.error(`Error executing button ${interaction.customId}:`, error);

		const errorMessage = 'There was an error while executing this button!';

		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: errorMessage,
					ephemeral: true,
				});
			} else {
				await interaction.reply({ content: errorMessage, ephemeral: true });
			}
		} catch (followUpError) {
			logger.error('Failed to send error message to user:', followUpError);
		}
	}
}

async function reloadButton(client, customId) {
	const buttonsPath = path.join(__dirname, '..', 'interactions', 'buttons');

	try {
		const jsFiles = await getAllJsFiles(buttonsPath);

		for (const filePath of jsFiles) {
			try {
				delete require.cache[require.resolve(filePath)];
				const button = require(filePath);

				if (button.customId === customId) {
					client.buttons.set(button.customId, button);
					logger.success(`Reloaded button: ${customId}`);
					return true;
				}
			} catch (error) {
				logger.error(`Error reloading button ${customId}:`, error);
			}
		}

		return false;
	} catch (error) {
		logger.error(`Error reloading button ${customId}:`, error);
		return false;
	}
}

module.exports = {
	loadButtons,
	handleButtonInteraction,
	reloadButton,
};
