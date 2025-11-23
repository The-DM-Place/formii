const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

async function loadEvents(client) {
	const eventsPath = path.join(__dirname, '..', 'events');

	try {
		await fs.access(eventsPath);

		const eventFiles = await fs.readdir(eventsPath);
		const jsFiles = eventFiles.filter((file) => file.endsWith('.js'));

		logger.info(`Found ${jsFiles.length} event files`);

		for (const file of jsFiles) {
			const filePath = path.join(eventsPath, file);

			try {
				delete require.cache[require.resolve(filePath)];

				const event = require(filePath);

				if (!event.name || !event.execute) {
					logger.warn(
						`Event file ${file} is missing required properties (name or execute)`
					);
					continue;
				}

				if (event.once) {
					client.once(event.name, (...args) =>
						event.execute(...args)
					);
				} else {
					client.on(event.name, (...args) => event.execute(...args));
				}

				logger.success(`Loaded event: ${event.name} (${file})`);
			} catch (error) {
				logger.error(`Error loading event from ${file}:`, error);
			}
		}
	} catch (error) {
		if (error.code === 'ENOENT') {
			logger.warn('Events directory not found, creating it...');
			await fs.mkdir(eventsPath, { recursive: true });
		} else {
			logger.error('Error loading events:', error);
		}
	}
}

async function reloadEvent(client, eventName) {
	const eventsPath = path.join(__dirname, '..', 'events');

	try {
		const eventFiles = await fs.readdir(eventsPath);
		const jsFiles = eventFiles.filter((file) => file.endsWith('.js'));

		for (const file of jsFiles) {
			const filePath = path.join(eventsPath, file);

			try {
				delete require.cache[require.resolve(filePath)];
				const event = require(filePath);

				if (event.name === eventName) {
					client.removeAllListeners(event.name);

					if (event.once) {
						client.once(event.name, (...args) =>
							event.execute(...args)
						);
					} else {
						client.on(event.name, (...args) =>
							event.execute(...args)
						);
					}

					logger.success(`Reloaded event: ${eventName}`);
					return true;
				}
			} catch (error) {
				logger.error(`Error reloading event ${eventName}:`, error);
			}
		}

		return false;
	} catch (error) {
		logger.error(`Error reloading event ${eventName}:`, error);
		return false;
	}
}

module.exports = {
	loadEvents,
	reloadEvent,
};
