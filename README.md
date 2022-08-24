# Mock Interactions for unit testing discord.js slash commands

Supports discord.js v14.3

## Introduction

Often, the simplest solution is best. You'll find people mocking libraries and APIs to do their unit testing, and the truth is, they're going to be reverse engineering libraries and APIs every time Discord or Discord.js make updates, until Discord stops existing. They're going to run into issues where they haven't mocked something they need, and need to go update their testing library for interactions.

This library takes the simplest path: Create a unit testing bot, mock interactions, ???, profit.

Any API or library calls within your commands will still work, because we're not mocking the client. So you can test within a real world context, just without human interaction! ^-^

By default, this library only reaches out to the Discord API on initialization of the interaction & options. Your commands may also reach out to the Discord API, but you'd have to go out of your way to be spammy, yeah?

## What you'll need
  1. A bot account for your CI/CD pipeline, as well as one for each dev who wants to test locally (that would be all of your devs).
  2. A Guild ID, Channel ID, and Role ID that the bot has access to.
  3. A non-bot User ID to originate the interactions from. (These interactions are NOT posted to the Discord API, however, I would recommend a user that you own)

## Setup

Okay, so you already have a Discord client set up. Use that.

```
import { client } from Discord.js;
import { optionsBuilder, interactionBuilder } from 'discord.js-mock-interactions';

const slep = ( boens ) => new Promise(resolve => setTimeout(resolve, boens));//gib slep ur boens


//const client = new Discord.Client({ intents: []}); //you already have your client set up, 
  //just make sure you're using the bot token you created for testing
```

Now, let's build our base interaction.

```
let interaction = await interactionBuilder(client,
  "<guild_id_here>",
  "<channel_id_here_for_testing>",
  "<user_id_for_interaction_source>");
```

Then initialize the types of options we'll use for testing. Values can come later, but defaults are nice.

```
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
```

We use the 'id' field to reference options more easily later. Note that in this example we set up two users for easy multi-user interactions, without having to remember actual Discord IDs. Review your commands to understand the maximum number of each type of option you need per command, as it may be easier to set their default values here (but you can always just build multiple of the same option later with different values!)

We support testing subcommands, but you'll notice we don't handle subcommand or subcommand group options. As we're not actively using groups, send us a PR or well-defined use case and we'll sort it out. ^-^

## Mocking an Interaction and Receiving a Reply

```
const checkBalanceReply = async ( resp ) => console.log(JSON.stringify(resp));
const checkBalance = interaction("APPLICATION_COMMAND", 
  "balance", 
   null,
   checkBalanceReply,
   [opts.build('bun','user')]);
client.emit('interactionCreate', checkBalance);
```

Let's start by creating a reply function to override **interaction.reply**. This is where we would do verification on a successful reply to our interaction.

`const checkBalanceReply = async ( resp ) => console.log(JSON.stringify(resp));`

We'll be creating the interaction **/balance @bun**, which expects the following option:

  `{type: 'USER', name: 'user', value: '<user_id>', member: Discord.Member, user: Discord.User}` 
  
Thankfully, **optionsBuilder** already handled all of that Discord stuff, so we can just use **opts.build('bun','user')**!
 
We create an interaction from our base interaction.

`const checkBalance = interaction("APPLICATION_COMMAND", "balance", null, checkBalanceReply, [opts.build('bun','user')]);`

Here, **opts.build('bun','user')** finds the opt with id 'bun' and returns a copy with its name set to 'user'.

Then we simply emit the interaction. :)

`client.emit('interactionCreate', checkBalance);`

## Mocking a Sub Command

Okay, but what about a Sub Command with more options!

```
const gibMunsReply = async ( resp ) => console.log(JSON.stringify(resp));
const gibMuns = interaction("APPLICATION_COMMAND",
  "modifybal",
   "add",
   gibMunsReply,
   [opts.build('bun','user'), opts.build('int','amount',1000)]);
client.emit('interactionCreate', gibMuns);
```

This one calls **/modifybal add @bun 1000**, which expects opts:
  
  `{type: 'USER', name: 'user', value: '<user_id>', member: Discord.Member, user: Discord.User}`
  
  `{type: 'INTEGER', name: 'amount', value: 1000}`

Let's wait a second, then check our balance again. :)
  
```
await slep(1000);
client.emit('interactionCreate', checkBalance);
```

Ahhh now you see how easy unit testing interactions can be :)


## To Do

Proper examples, but honestly everyone's unit testing configuration will be different--this library only provides a way to mock discord.js interactions and leaves test implementation up to you. :)

