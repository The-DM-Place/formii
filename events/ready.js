const { Events, ActivityType } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		logger.success(`Ready! Logged in as ${client.user.tag}`);
		logger.info(`Bot is running in ${client.guilds.cache.size} servers`);
		const statuses = [
			{ name: 'Managing applications', type: ActivityType.Custom },
			{ name: 'Reviewing submissions', type: ActivityType.Custom },
			{ name: 'Configuring application settings', type: ActivityType.Custom },
			{ name: 'Processing results', type: ActivityType.Custom },
			{ name: 'Assisting applicants', type: ActivityType.Custom }
		];

		let i = 0;
		setInterval(() => {
			const status = statuses[i];
			client.user.setActivity(status.name, { type: status.type });
			i = (i + 1) % statuses.length;
		}, 15_000); // changes every 15 seconds
	},
};
