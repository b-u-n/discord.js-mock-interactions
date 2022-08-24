# Mock Interactions for discord.js unit testing

## Introduction

Often, the simplest solution is best. You'll find people mocking libraries and APIs to do their unit testing, and the truth is, they're going to be reverse engineering libraries and APIs every time Discord or Discord.js make updates, until Discord stops existing.

This library takes the simplest path: Create a unit testing bot, mock interactions, ???, profit.

Any API or library calls within your commands will still work, because we're not mocking the client. So you can test within a real world context, just without human interaction! ^-^

## tl;dr

```
import { client } from Discord.js;
import { optionsBuilder, interactionBuilder } from 'discord.js-mock-interactions';

//gib slep ur boens
const slep = ( boens ) => new Promise(resolve => setTimeout(resolve, boens));


//const client = new Discord.Client({ intents: []}); //you already have your client set up

//first, we build our base interaction
let interaction = await interactionBuilder(client, "<guild_id_here>", "<channel_id_here_for_testing>", "<user_id_for_interaction_source>");

//initialize the types of options we'll use for testing--values can come later (but defaults are nice)!
const opts = await optionsBuilder(client, "<guild_id_here>", [
  { id: 'string', type: 'STRING', value: 'cheeses' },
  { id: 'int', type: 'INTEGER', value: 1 },
  { id: 'bool', type: 'BOOLEAN', value: true },
  { id: 'bun', type: 'USER', value: '<user_id_here>' },
  { id: 'iara', type: 'USER', value: '<user_id_here>' },
  { id: 'channel', type: 'CHANNEL', value: '<channel_id_here>' },
  { id: 'role', type: 'ROLE', value: '<role_id_here>' },
  { id: 'mention', type: 'MENTIONABLE', value: '<role_or_user_id_here>' },
  { id: 'num', type: 'NUMBER', value: 3.14 }
]);

//note two users--so we can have source / target for multi-user interactions, this is why everything has an id--make as many whatever as you need!

//you'll notice we don't handle subcommand or subcommand group options--this is wise. we have an option to test subcommands, but groups isn't something we use, so send a PR or defined use case and we'll sort it out. ^-^


//create a check balance interaction from our base interaction, passing in an array of options built using our option ids up there ^

//we start by creating a reply function to override interaction.reply
const checkBalanceReply = async ( resp ) => console.log(JSON.stringify(resp));

//this one takes the 'bun' user and sets its name to 'user'. we're fine with the existing value, so none is passed :)
const checkBalance = interaction("APPLICATION_COMMAND", "balance", null, checkBalanceReply, [opts.build('bun','user')]);

//aaand emit the interaction
client.emit('interactionCreate', checkBalance);


//okay, but what about a subcommand with more options!

const gibMunsReply = async ( resp ) => console.log(JSON.stringify(resp));
const gibMuns = interaction("APPLICATION_COMMAND", "modifybal", "add", gibMunsReply, [opts.build('bun','user'), opts.build('int','amount',1000)]);
client.emit('interactionCreate', gibMuns);

//^ this one calls "/modifybal add @bun 1000"


//easy, let's wait a second
//and check our bal again :)
await slep(1000);
client.emit('interactionCreate', checkBalance);


//ahhh now you see how easy unit testing interactions can be :)

```
