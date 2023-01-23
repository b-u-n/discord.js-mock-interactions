import { to } from 'await-to-js';
import { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { Generator } from 'snowflake-generator';

const optionsBuilder = async ({ client, guildId, options }) => {
  const guild = await client.guilds.fetch(guildId);
  const types = {'SUB_COMMAND': 1, 'SUB_COMMAND_GROUP': 2, 'STRING': 3, 'INTEGER': 4, 'BOOLEAN': 5, 'USER': 6, 'CHANNEL': 7, 'ROLE': 8, 'MENTIONABLE': 9, 'NUMBER': 10, 'ATTACHMENT': 11}

  let opts = await Promise.all(options.map(async o => {
    switch(o.type){
      case 'USER':
        o.member = await guild.members.fetch(o.value);
        o.user = o.member.user;
        break;
      case 'CHANNEL':
        o.channel = await guild.channels.fetch(o.value);
        break;
      case 'ROLE':
        o.role = await guild.roles.fetch(o.value);
        break;
      case 'MENTIONABLE':
        let role,member,err;
        [role, err] = await to(guild.roles.fetch(o.value));
        if(err || !role){
          [member, err] = await to(guild.members.fetch(o.value));
          if(!err && member) o.member = member;
          break;
        }
        o.role = role;
        break;
      default:break;
    }
    o.type=types[o.type];
    return o;
  }));
  return {build: async ({ id, name, value }) => {
    let opt = opts.find(e => e.id === id)
    if(name) opt.name = name;
    if(value) {
      opt.value=value;
      switch(opt.type){
        case 'USER':
          opt.member = await guild.members.fetch(opt.value);
          opt.user = opt.member.user;
          break;
        case 'CHANNEL':
          opt.channel = await guild.channels.fetch(opt.value);
          break;
        case 'ROLE':
          opt.role = await guild.roles.fetch(opt.value);
          break;
        case 'MENTIONABLE':
          if(opt.value.indexOf('&')>0){
            opt.role = await guild.roles.fetch(opt.value);
          }else{
            opt.member = await guild.members.fetch(opt.value);
          }
        default:break;
      }
    }
    return opt;
  }}
};

const interactionBuilder = async ({ client, applicationId, guildId, channelId, userId }) => {
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(userId);
  const channel = await guild.channels.fetch(channelId);
  const user = member.user;
  const snowflakeGenerator = new Generator(1420070400000); 

  return ({ type, name, subcommand, reply, options, commandId }) => {
    let interaction = new CommandInteraction(client, {data: { type, guild, user }, user});
    interaction.id = snowflakeGenerator.generate().toString();
    interaction.type = type;
    interaction.guildId = guild.id;
    interaction.reply = reply;
    interaction.commandName = name;
    interaction.channelId = channelId;
    interaction.applicationId = applicationId;
    interaction.commandId = commandId;
    interaction.member = member;
    interaction.options = new CommandInteractionOptionResolver(client, options);
    interaction.options._subcommand = subcommand;
    interaction.isCommand = () => true;
    return interaction;
  }
};

export { optionsBuilder, interactionBuilder };