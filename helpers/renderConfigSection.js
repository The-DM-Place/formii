const {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder,
} = require('discord.js');
const logger = require('../utils/logger');
const Config = require('../models/configSchema');
const ApplicationType = require('../models/applicationTypeSchema');


module.exports = async function renderConfigSection(interaction, page = 'overview') {
	try {
		const container = new ContainerBuilder();

		if (page === 'overview') {
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent('## Overview\n*Overview of the current settings*')
			);
			container.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true)
			);
			const guildConfig = await Config.getConfig(interaction.guild.id);

			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(`**Applications Enabled:** ${guildConfig.applicationsEnabled ? 'True' : 'False'}`),
				new TextDisplayBuilder().setContent(`**Applications Channel:** ${guildConfig.applicationsChannelId ? `<#${guildConfig.applicationsChannelId}>` : 'Not Set'}`),
				new TextDisplayBuilder().setContent(`**Results Channel:** ${guildConfig.resultsChannelId ? `<#${guildConfig.resultsChannelId}>` : 'Not Set'}`),
				new TextDisplayBuilder().setContent(`**Admin Role:** ${guildConfig.adminRoleId ? `<@&${guildConfig.adminRoleId}>` : 'Not Set'}`),
				new TextDisplayBuilder().setContent(`**Accepted Message:** ${guildConfig.acceptedMessage}`),
				new TextDisplayBuilder().setContent(`**Failed Message:** ${guildConfig.failedMessage}`)
			);

			const toggleApplicationsButton = new ButtonBuilder()
				.setCustomId('toggle_applications')
				.setLabel(guildConfig.applicationsEnabled ? 'Disable Applications' : 'Enable Applications')
				.setStyle(ButtonStyle.Secondary);
			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(toggleApplicationsButton)
			);

		} else if (page === 'applications') {
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent('## Applications\n*Manage application types*')
			);
			container.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true)
			);

			const newAppButton = new ButtonBuilder()
				.setCustomId('create_new_application')
				.setLabel('Create New Application')
				.setStyle(ButtonStyle.Secondary);

			const viewAppsMenu = new StringSelectMenuBuilder()
				.setCustomId('view_applications')
				.setPlaceholder('Select an application to view');
			const appTypes = await ApplicationType.find({});
			if (appTypes.length === 0) {
				viewAppsMenu.addOptions([
					{
						label: 'No Applications Found',
						value: 'no_applications',
						description: 'Create an application first'
					}
				]);
			} else {
				viewAppsMenu.addOptions(
					appTypes.map(app => ({
						label: app.name,
						value: app.id.toString()
					}))
				);
			}

			const editAppMenu = new StringSelectMenuBuilder()
				.setCustomId('edit_applications')
				.setPlaceholder('Select an application to edit');
			if (appTypes.length === 0) {
				editAppMenu.addOptions([
					{
						label: 'No Applications Found',
						value: 'no_applications',
						description: 'Create an application first'
					}
				]);
			} else {
				editAppMenu.addOptions(
					appTypes.map(app => ({
						label: app.name,
						value: app.id.toString()
					}))
				);
			}

			const toggleTypeMenu = new StringSelectMenuBuilder()
				.setCustomId('toggle_application_type')
				.setPlaceholder('Enable/Disable application types');
			if (appTypes.length === 0) {
				toggleTypeMenu.addOptions([
					{
						label: 'No Applications Found',
						value: 'no_applications',
						description: 'Create an application first'
					}
				]);
			} else {
				toggleTypeMenu.addOptions(
					appTypes.map(app => ({
						label: app.name,
						value: app.id.toString()
					}))
				);
			}

			const deleteAppsMenu = new StringSelectMenuBuilder()
				.setCustomId('delete_applications')
				.setPlaceholder('Select applications to delete')
				.setMinValues(1)
				.setMaxValues(1);
			if (appTypes.length === 0) {
				deleteAppsMenu.addOptions([
					{
						label: 'No Applications Found',
						value: 'no_applications',
						description: 'Create an application first'
					}
				]);
			} else {
				deleteAppsMenu.addOptions(
					appTypes.map(app => ({
						label: app.name,
						value: app.id.toString()
					}))
				);
			}

			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(newAppButton)
			);
			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(deleteAppsMenu)
			);
			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(toggleTypeMenu)
			);
			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(viewAppsMenu)
			);
			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(editAppMenu)
			);

		} else if (page === 'channels') {
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent('## Channels\n*Manage channel settings*')
			);

			container.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true)
			);
			const guildConfig = await Config.getConfig(interaction.guild.id);

			const applicationsChannelMenu = new ChannelSelectMenuBuilder()
				.setCustomId('select_applications_channel')
				.setPlaceholder(guildConfig.applicationsChannelId ? `Applications Channel: <#${guildConfig.applicationsChannelId}>` : 'Select Applications Channel')
				.addChannelTypes(0);
			const resultsChannelMenu = new ChannelSelectMenuBuilder()
				.setCustomId('select_results_channel')
				.setPlaceholder(guildConfig.resultsChannelId ? `Results Channel: <#${guildConfig.resultsChannelId}>` : 'Select Results Channel')
				.addChannelTypes(0);

			const setAdminRoleMenu = new RoleSelectMenuBuilder()
				.setCustomId('select_admin_role')
				.setPlaceholder(guildConfig.adminRoleId ? `Admin Role: <@&${guildConfig.adminRoleId}>` : 'Select Admin Role')
				.setMinValues(1)
				.setMaxValues(1);

			const setApprovedMessageButton = new ButtonBuilder()
				.setCustomId('set_approved_message')
				.setLabel('Set Approved Message')
				.setStyle(ButtonStyle.Secondary);
			const setRejectedMessageButton = new ButtonBuilder()
				.setCustomId('set_rejected_message')
				.setLabel('Set Rejected Message')
				.setStyle(ButtonStyle.Secondary);


			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(applicationsChannelMenu)
			);
			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(resultsChannelMenu)
			);
			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(setAdminRoleMenu)
			);
			container.addActionRowComponents(
				new ActionRowBuilder().addComponents(setApprovedMessageButton, setRejectedMessageButton)
			);


		} else {
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent('Unknown page.')
			);
		}

		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true)
		);

		function getButtonProps(btnPage) {
			return {
				style: page === btnPage ? ButtonStyle.Primary : ButtonStyle.Secondary
			};
		}

		const overviewButton = new ButtonBuilder()
			.setCustomId('config_overview')
			.setLabel('Overview')
			.setStyle(getButtonProps('overview').style);

		const applicationsButton = new ButtonBuilder()
			.setCustomId('config_applications')
			.setLabel('Applications')
			.setStyle(getButtonProps('applications').style);

		const channelsButton = new ButtonBuilder()
			.setCustomId('config_channels')
			.setLabel('Channels')
			.setStyle(getButtonProps('channels').style);

		container.addActionRowComponents(
			new ActionRowBuilder().addComponents(overviewButton, applicationsButton, channelsButton)
		);

		return { components: [container] };
	} catch (error) {
		logger.error('Error rendering settings section:', error);
		const container = new ContainerBuilder();
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'Error loading settings.'
			)
		);
		return { components: [container] };
	}
};

