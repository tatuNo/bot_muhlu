require('dotenv').config()
const _ = require ('lodash')

const axios = require('axios')
const { Client, GatewayIntentBits } = require('discord.js')
const token = process.env.DISCORD_TOKEN

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

const config = {
	headers: { Authorization: `Bearer ${process.env.FACEIT_KEY}`}
}

client.once('ready', () => {
	console.log('Ready!')
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return

	const { commandName } = interaction

	if (commandName === 'kartat') {
		const id = interaction.options.getString('input')
		
		try {
			const { data: { teams: { faction1, faction2 }}} = await axios.get(`https://open.faceit.com/data/v4/matches/${id}`, config)

			const team1 = []
			const team2 = []

			await Promise.all(
				faction1.roster.map(async player => {
					team1.push(await getStats(player))
				})
			)

			await Promise.all(
				faction2.roster.map(async player => {
					team2.push(await getStats(player))
				})
			)

			const groupedTeam1 = groupTeam(team1)
			const groupedTeam2 = groupTeam(team2)

			const team1String = getString(groupedTeam1)
			const team2String = getString(groupedTeam2)
			
			await interaction.reply(`__**${faction1.name}**__ \n\n ${team1String} \n\n __**${faction2.name}**__ \n\n ${team2String}`)
		} catch (error) {
			await interaction.reply('Kusinen id -.-')
		}
	} 
})

client.login(token)

const getString = (team) => {
	let string = ''
	team.forEach(element => {
		string += `**${element.label}** \t pelattu: ${element.matches}\t voittoprosentti: ${roundToTwo((element.wins / element.matches) * 100)}% \n`
	})
	return string
}

const groupTeam = (team) => {
	return _(team)
		.flatten()
		.groupBy(x => x.label)
			.map((objs, key) => {
				return {
					'label': key,
					'wins': _.sumBy(objs, item => Number(item.stats.Wins)),
					'matches': _.sumBy(objs, item => Number(item.stats.Matches))
				}
			})
		.value()
}

const getStats = async (player) => {
	const { data } = await axios.get(`https://open.faceit.com/data/v4/players/${player.player_id}/stats/csgo`, config)
	const maps = data.segments.filter(data => data.mode === '5v5')
	return maps
}

const roundToTwo = (num) => {
	return +(Math.round(num + "e+2")  + "e-2");
}