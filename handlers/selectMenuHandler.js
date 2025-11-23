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

async function loadSelectMenus(client) {
    const selectMenusDirs = [
        path.join(__dirname, '..', 'interactions', 'menus'),
        path.join(__dirname, '..', 'interactions', 'buttons', 'applications')
    ];

    let totalFiles = 0;
    for (const selectMenusPath of selectMenusDirs) {
        logger.info(`Loading select menus from: ${selectMenusPath}`);
        try {
            await fs.access(selectMenusPath);
            const jsFiles = await getAllJsFiles(selectMenusPath);
            totalFiles += jsFiles.length;
            logger.info(`Found ${jsFiles.length} select menu handler files`);
            for (const filePath of jsFiles) {
                const file = path.basename(filePath);
                try {
                    delete require.cache[require.resolve(filePath)];
                    const selectMenu = require(filePath);
                    if (!selectMenu.customId || !selectMenu.execute) {
                        logger.warn(
                            `Select menu file ${file} is missing required properties (customId or execute)`
                        );
                        continue;
                    }
                    client.selectMenus.set(selectMenu.customId, selectMenu);
                    logger.success(
                        `Loaded select menu: ${selectMenu.customId} (${file})`
                    );
                } catch (error) {
                    logger.error(`Error loading select menu from ${file}:`, error);
                }
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                logger.warn(`Select menus directory not found: ${selectMenusPath}, creating it...`);
                await fs.mkdir(selectMenusPath, { recursive: true });
            } else {
                logger.error('Error loading select menus:', error);
            }
        }
    }
    logger.info(`Total select menus loaded: ${client.selectMenus.size} from ${totalFiles} files`);
}

async function handleSelectMenuInteraction(interaction) {
    logger.info(`Handling select menu interaction: ${interaction.customId}`);
    logger.info(`Available select menus: ${Array.from(interaction.client.selectMenus.keys()).join(', ')}`);


    let selectMenu = interaction.client.selectMenus.get(interaction.customId);
    logger.info(`Exact match result: ${selectMenu ? 'Found' : 'Not found'}`);

    if (!selectMenu) {
        logger.info('Trying function and regex patterns...');
        for (const [key, selectMenuHandler] of interaction.client.selectMenus) {
            logger.info(`Checking pattern: ${key} (${selectMenuHandler.customId})`);
            if (typeof key === 'function' && key(interaction.customId)) {
                selectMenu = selectMenuHandler;
                logger.info(`Function match found: ${key}`);
                break;
            }
            if (selectMenuHandler.customId instanceof RegExp && selectMenuHandler.customId.test(interaction.customId)) {
                selectMenu = selectMenuHandler;
                logger.info(`Regex match found: ${key}`);
                break;
            }
        }
    }

    if (!selectMenu) {
        logger.warn(
            `No select menu handler found for customId: ${interaction.customId}. Available handlers: ${Array.from(interaction.client.selectMenus.keys()).join(', ')}`
        );

        try {
            await interaction.reply({
                content: 'This selection menu is not currently available. Please try again later.',
                ephemeral: true,
            });
        } catch (error) {
            logger.error('Failed to send select menu not found message:', error);
        }
        return;
    }

    logger.info(`Executing select menu: ${interaction.customId}`);
    try {
        await selectMenu.execute(interaction);
        logger.info(
            `Select menu executed: ${interaction.customId} by ${interaction.user.tag}`
        );
    } catch (error) {
        logger.error(
            `Error executing select menu ${interaction.customId}:`,
            error
        );

        const errorMessage =
            'There was an error while processing this selection! Please try again.';

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

async function reloadSelectMenu(client, customId) {
    const selectMenusPath = path.join(__dirname, '..', 'interactions', 'menus');

    try {
        const jsFiles = await getAllJsFiles(selectMenusPath);

        for (const filePath of jsFiles) {
            try {
                delete require.cache[require.resolve(filePath)];
                const selectMenu = require(filePath);

                if (selectMenu.customId === customId) {
                    client.selectMenus.set(selectMenu.customId, selectMenu);
                    logger.success(`Reloaded select menu: ${customId}`);
                    return true;
                }
            } catch (error) {
                logger.error(`Error reloading select menu ${customId}:`, error);
            }
        }

        return false;
    } catch (error) {
        logger.error(`Error reloading select menu ${customId}:`, error);
        return false;
    }
}

module.exports = {
    loadSelectMenus,
    handleSelectMenuInteraction,
    reloadSelectMenu,
};