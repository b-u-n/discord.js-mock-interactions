import { Client, GatewayIntentBits, Events } from 'discord.js';
import { optionsBuilder, interactionBuilder } from 'discord.js-mock-interactions';

import * as dotenv from 'dotenv'
dotenv.config()

//this assumes the following environment variables
/*
	APPLICATION_ID
	GUILD_ID
	CHANNEL_ID
	USER_ID
	USER_ID_2
	ROLE_ID
	MENTIONABLE_ID
*/


//setup bot

const client = new Client({ intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers]}); 


console.log(process.env.BOT_TOKEN);
client.login(process.env.BOT_TOKEN);

client.on(Events.InteractionCreate, interaction => {
	console.log(interaction, 'received interaction, this is just whatever you bot already does');
	console.log(interaction.options, 'interaction options');
	interaction.reply({content: 'we did bot stuff'});
});


client.once(Events.ClientReady, async c=> {
	//setup mock interactions
	let interaction = await interactionBuilder(
		{client,
		applicationId: process.env.APPLICATION_ID,
		guildId: process.env.GUILD_ID,
		channelId: process.env.CHANNEL_ID,
		userId: process.env.USER_ID});


	const opts = await optionsBuilder({
		client,
		guildId: process.env.GUILD_ID,
		options: [
			{ id: 'string', type: 'STRING', value: 'cheeses' },
			{ id: 'int', type: 'INTEGER', value: 1 },
			{ id: 'bool', type: 'BOOLEAN', value: true },
			{ id: 'bun', type: 'USER', value: process.env.USER_ID },
			{ id: 'iara', type: 'USER', value: process.env.USER_ID_2 },
			{ id: 'channel', type: 'CHANNEL', value: process.env.CHANNEL_ID },
			{ id: 'role', type: 'ROLE', value: process.env.ROLE_ID },
			{ id: 'mention', type: 'MENTIONABLE', value: process.env.MENTIONABLE_ID },
			{ id: 'num', type: 'NUMBER', value: 3.14 }
		]
	});


	//initial test interaction example
	// /modifybal add @bun 1000

	//these functions are for testing the results of your interaction
	const modifybalReply = async ( resp ) => console.log('modifybalReply', JSON.stringify(resp));
	const modifybalDeferReply = async ( resp ) => console.log('modifybalDeferReply', JSON.stringify(resp));
	const modifybalEditReply = async ( resp ) => console.log('modifybalEditReply', JSON.stringify(resp));
	const modifybalFollowUp = async ( resp ) => console.log('modifybalFollowUp', JSON.stringify(resp));
	const modifybalDeleteReply = async ( resp ) => console.log('modifybalDeleteReply', JSON.stringify(resp));
	//probably don't need all of them

	const modifybal = interaction({
		type: "APPLICATION_COMMAND",
		name: "modifybal",
		subcommand: "add",
		commandId: '1234',
		reply: modifybalReply,
		deferReply: modifybalDeferReply,
		editReply: modifybalEditReply,
		followUp: modifybalFollowUp,
		deleteReply: modifybalDeleteReply,
		options: [
			await opts.build({id: 'bun', name:'user'}),
			await opts.build({id: 'int', name:'amount', value: 1000})
		]
	});

	client.emit('interactionCreate', modifybal);//emit the interaction
});