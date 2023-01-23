# Mock Interactions for unit testing discord.js slash commands

Supports discord.js v14.3

## TL;DR

```import { Client, GatewayIntentBits, Events } from 'discord.js';
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


	//test interaction example
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
```

## Introduction

This library takes the simplest path for interaction testing: Mock interactions, ???, profit.

Any API or library calls within your commands will still work, because we're not mocking the client. So you can test within a real world context, just without human interaction!

This library should only reach out to the Discord API on initialization of the interaction and options, and creation of a new option value. Your commands may also reach out to the Discord API, but you'd have to go out of your way to be spammy, yeah?

## What you'll need
  1. A test bot for your CI/CD pipeline, as well as one for each dev who wants to test locally (that would be all of your devs).
		(This requires at least Guilds and Guild.Members intents)
  2. A Guild ID, Channel ID, and Role ID that the bot has access to.
  3. A non-bot User ID to originate the interactions from. (These interactions are NOT posted to the Discord API, however, I would recommend a user that you own)

## Setup

Okay, so you already have a Discord client set up, and you're doing bot stuff. Use that.

```
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
	interaction.reply({content: 'we did bot stuff'});
});
```

Now, let's build our base interaction.

```
let interaction = await interactionBuilder(
	{client,
	applicationId: process.env.APPLICATION_ID,
	guildId: process.env.GUILD_ID,
	channelId: process.env.CHANNEL_ID,
	userId: process.env.USER_ID});
```

Then initialize the types of options we'll use for testing. Values can be changed later, but defaults are nice.

```
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
```

We use the 'id' field to reference options more easily later. Note that in this example we set up two users for easy multi-user interactions, without having to remember actual Discord IDs. Review your commands to understand the maximum number of each type of option you need per command, as it may be easier to set their default values here (but you can always just build multiple of the same option later with different values!)

We support testing subcommands, but you'll notice we don't handle subcommand or subcommand group options. As we're not actively using groups, send us a PR or well-defined use case and we'll sort it out.

## Mocking an Interaction and Receiving a Reply

### Interaction: /balance @bun

```
//test interaction example
// /balance @bun

//these functions are for testing the results of your interaction
const balanceReply = async ( resp ) => console.log('balanceReply', JSON.stringify(resp));
const balanceDeferReply = async ( resp ) => console.log('balanceDeferReply', JSON.stringify(resp));
const balanceEditReply = async ( resp ) => console.log('balanceEditReply', JSON.stringify(resp));
const balanceFollowUp = async ( resp ) => console.log('balanceFollowUp', JSON.stringify(resp));
const balanceDeleteReply = async ( resp ) => console.log('balanceDeleteReply', JSON.stringify(resp));
//probably don't need all of them

const balance = interaction({
	type: "APPLICATION_COMMAND",
	name: "balance",
	reply: balanceReply,
	deferReply: balanceDeferReply,
	editReply: balanceEditReply,
	followUp: balanceFollowUp,
	deleteReply: balanceDeleteReply,
	options: [
		await opts.build({id: 'bun', name:'user'}),
	]
});

client.emit('interactionCreate', balance);//emit the interaction
```

We start by creating a reply function to override **interaction.reply** and any other response functions you might use for that interaction. This is where we would do verification on a successful reply to our interaction. Failure to do this will send fake interaction responses to Discord, which will be rejected for not existing.

**/balance @bun** expects the following option:

  `{type: 'USER', name: 'user', value: '<user_id>', member: Discord.Member, user: Discord.User}` 
  
Thankfully, **optionsBuilder** already handled all of the Discord stuff, so we can just use **await opts.build({id: 'bun', name:'user'})**! It will find the opt with id 'bun' and return a copy with its name set to 'user'.
 
We create an interaction from our base interaction.

```
const balance = interaction({
	type: "APPLICATION_COMMAND",
	name: "balance",
	reply: balanceReply,
	deferReply: balanceDeferReply,
	editReply: balanceEditReply,
	followUp: balanceFollowUp,
	deleteReply: balanceDeleteReply,
	options: [
		await opts.build({id: 'bun', name:'user'}),
	]
});
```

Then we simply emit the interaction. :)

`client.emit('interactionCreate', balance);`

## Mocking a Sub Command

Okay, but what about a Sub Command with more options!

### Interaction: /modifybal add @bun 1000
```
//test interaction example
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
```

**/modifybal add @bun 1000** expects opts:
  
  `{type: 'USER', name: 'user', value: '<user_id>', member: Discord.Member, user: Discord.User}`
  
  `{type: 'INTEGER', name: 'amount', value: 1000}`
  
Notably, we set the value for the 'amount' option this time. That works for any option, just like the option name.

Let's wait a second, then check our balance again. :)
  
```
client.emit('interactionCreate', balance);
```

Ahhh now you see how easy unit testing interactions can be :)


## To Do

Examples: DONE!

This library only provides a way to mock discord.js interactions and leaves test implementation up to you. :)

