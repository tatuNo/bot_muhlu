require('dotenv').config()
const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const commands = [
  new SlashCommandBuilder().setName('kartat').setDescription('Vastaa ottelun karttatilastoilla').addStringOption(option =>
		option.setName('input')
			.setDescription('Matsin ID')
			.setRequired(true))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);