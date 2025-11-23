const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const path = require('path');
require('dotenv').config();

const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { loadButtons } = require('./handlers/buttonHandler');
const { loadModals } = require('./handlers/modalHandler');
const { loadSelectMenus } = require('./handlers/selectMenuHandler');

const logger = require('./utils/logger');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.DirectMessages,
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.User,
	],
});

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selectMenus = new Collection();

async function initializeBot() {
	try {
		logger.info('Connecting to the database...');
		require('./connections/database');

		logger.info('Loading commands...');
		await loadCommands(client);

		logger.info('Loading events...');
		await loadEvents(client);

		logger.info('Loading button handlers...');
		await loadButtons(client);

		logger.info('Loading modal handlers...');
		await loadModals(client);

		logger.info('Loading select menu handlers...');
		await loadSelectMenus(client);

		logger.info('Bot initialization complete!');
	} catch (error) {
		logger.error('Error during bot initialization:', error);
		process.exit(1);
	}
}

initializeBot().then(() => {
	console.log('Bot initialization completed, attempting login...');
	client.login(process.env.DISCORD_TOKEN);
});

client.once('ready', async () => {
	console.log(`Bot is ready! Logged in as ${client.user.tag}`);
	console.log(`Select menus loaded: ${client.selectMenus.size}`);
	console.log(`Available select menu IDs: ${Array.from(client.selectMenus.keys()).join(', ')}`);
});

process.on('unhandledRejection', (error) => {
	logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception:', error);
	process.exit(1);
});

module.exports = client;
