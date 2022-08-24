const Discord = require('discord.js');
const { CommandInteraction } = Discord;

const optionsBuilder = async ( client, guildId, opts ) => {
  const guild = await client.guilds.fetch(guildId);

  opts = await Promise.all(opts.map(async o => {
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
        o.role = await guild.roles.fetch(o.value);
        o.member = await guild.members.fetch(o.value);
        if(o.member) o.user = o.member.user;
      default:break;
    }
    return o;
  }));
  return {build: ( id, name, value ) => {
    let opt = opts.find(e => e.id === id)
    if(name) opt.name = name;
    if(value) opt.value = value;
    return opt;
  }}
}

const interactionBuilder = async ( client, guildId, channelId, userId) => {
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(userId);
  const channel = await guild.channels.fetch(channelId);
  const user = member.user;

  return (type, commandName, subcommand, reply, opts) => {
    let interaction = new CommandInteraction(client, {data: { channelId }, user, member, guild, channel});
    interaction.type = type;
    interaction.guildId = guild.id;
    interaction.reply = reply;
    interaction.commandName = commandName;
    interaction.guild = guild;
    interaction.member = member;
    interaction.user = user;
    interaction.options._subcommand = subcommand;
    interaction.options._hoistedOptions = opts;
    return interaction;
  }
}

module.exports = { optionsBuilder, interactionBuilder }