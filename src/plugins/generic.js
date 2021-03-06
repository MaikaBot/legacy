const Plugin                    = require('../structures/plugin');
const { stripIndents }          = require('common-tags');
const { version: Eris }         = require('../../node_modules/eris/package.json');
const { version, dependencies } = require('../../package.json');
const { humanize }              = require('../deps');

module.exports = new Plugin({
    name: 'Generic',
    visible: true,
    embeded: 'ℹ Generic',
    enabled: true,
    commands: [{
        command: 'about',
        description: 'Shows information about me, Maika!',
        aliases: ['me'],
        category: 'Generic',
        run: (msg) => msg.embed({
            description: stripIndents`
                :wave: **Hello, ${msg.sender.username}! I am ${msg.bot.user.username}.**
                Use \`${msg.prefix}help\` to see what commands ${msg.bot.user.username} has!**
                
                \`\`\`fix
                GUILDS: ${msg.bot.guilds.size}
                USERS: ${msg.bot.users.size}
                CHANNELS: ${Object.keys(msg.bot.channelGuildMap).length}
                SHARDS: ${msg.guild.shard.id}/${msg.bot.shards.size}
                PLUGINS: ${msg.bot.registry.plugins.size}
                UPTIME: ${humanize(Date.now() - msg.bot.startTime)}
                MEMORY USAGE: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
                DEPENDENCIES [${Object.keys(dependencies).length}]: ${Object.entries(dependencies).map(s => s[0]).join(', ')}
                ERIS: v${Eris}
                NODE: ${process.version}
                MAIKA: v${version}
                \`\`\`
            `,
            color: msg.bot.color
        })
    },
    {
        command: 'help',
        description: 'Gives a list of my plugins or gives a list of commands in that plugin.',
        usage: '[plugin]',
        aliases: ['halp', 'plugin', 'plugins', 'h'],
        category: 'Generic',
        run: (msg) => {
            const plugins = msg.bot.registry.plugins.filter(c => ['280158289667555328'].includes(msg.sender.id) ? true : c.visible);

            if (!msg.args[0])
                return msg.embed({
                    title: `${msg.bot.user.username}#${msg.bot.user.discriminator} | Plugins`,
                    description: stripIndents`
                        Here are a list of plugins, use \`${msg.prefix}help [plugin]\` to view the plugin's commands!

                        ${plugins.map(s => `**${s.name}** (\`${msg.prefix}help ${s.name.toLowerCase()}\`)`).join('\n')}
                    `,
                    color: msg.bot.color,
                    footer: { text: `${msg.bot.registry.plugins.size} Plugins` }
                });

            const p = plugins.filter((m) => m.name.toLowerCase() === msg.args.join(' ').toLowerCase())[0];
            if (p)
                return msg.embed({
                    title: p.embeded,
                    description: p.commands.map(s => `**${msg.prefix}${s.command}${s.usage ? ` ${s.usage}` : ''}**:  ${s.description}`).join('\n'),
                    color: msg.bot.color,
                    footer: { text: `${p.count} Commands` }
                });
            else
                return msg.reply(`**${msg.sender.username}**: The plugin \`${msg.args[0]}\` doesn't exist.`);
        }
    },
    {
        command: 'inviteme',
        description: 'Invite me to your discord server or join mine!',
        aliases: ['invite'],
        category: 'Generic',
        run: (msg) => msg.embed({
            description: stripIndents`
                **Invite**: <https://discordapp.com/oauth2/authorize?client_id=${msg.bot.user.id}&scope=bot>
                **Discord Server**: https://discord.gg/7TtMP2n
            `
        })
    },
    {
        command: 'ping',
        description: 'Pong!',
        category: 'Generic',
        aliases: ['ping-pong'],
        run: async (msg) => {
            let start = Date.now();
            const message = await msg.reply(`**${msg.sender.username}**: Pong?`);
            await message.delete();
            return msg.reply(stripIndents`
                **${msg.sender.username}**: Pong!

                :rosette: **Shard #${msg.guild.shard.id}**: \`${msg.guild.shard.latency}ms\`
                :pencil: **Message**: \`${Date.now() - start}ms\`
            `);
        }
    },
    {
        command: 'shards',
        description: 'Shows information on all shards or a specific shard.',
        usage: '[shard]',
        category: 'Generic',
        aliases: ['shardinfo', 'shard'],
        run: async (msg) => {
            if (!msg.args[0]) {
                const message = await msg.reply(`**${msg.sender.username}**: Grabbing shard information`);
                let shardMap = '';
                msg.bot.shards.map(shard => shardMap += `[Shard #${shard.id}]: Latency: ${shard.latency}ms | Status: ${shard.status}`).join('\n');
                await message.delete();
                let current = msg.guild.shard;
                return msg.code('ini', stripIndents`
                    # CURRENT SHARD:
                    [Shard #${current.id}]: Latency: ${current.latency}ms | Status: ${current.status}

                    # ALL SHARDS:
                    ${shardMap}
                `);
            }

            const shard = msg.bot.shards.get(Number(msg.args[0]));
            if (shard)
                return msg.code('asciidoc', stripIndents`
                    = Shard #${shard.id} =
                    Latency :: ${shard.latency}ms
                    Status  :: ${shard.status}
                `);
            else
                return msg.reply(`**${msg.sender.username}**: No shard was found.`);
        }
    },
    {
        command: 'source',
        description: 'Grabs Maika\'s Github repository URL',
        aliases: ['src', 'sauce'],
        run: (msg) => msg.reply(`**${msg.sender.username}**: <https://github.com/MaikaBot/Maika>`)
    },
    {
        command: 'statistics',
        description: 'Gives Maika\'s current statistics',
        aliases: ['stats', 'botinfo', 'bot', 'info'],
        category: 'Generic',
        run: (msg) => msg.code('fix', stripIndents`
            GUILDS: ${msg.bot.guilds.size}
            USERS: ${msg.bot.users.size}
            CHANNELS: ${Object.keys(msg.bot.channelGuildMap).length}
            SHARDS: ${msg.guild.shard.id}/${msg.bot.shards.size}
            PLUGINS: ${msg.bot.registry.plugins.size}
            UPTIME: ${humanize(Date.now() - msg.bot.startTime)}
            MEMORY USAGE: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
            DEPENDENCIES: ${Object.entries(dependencies).map(s => s[0]).join(', ')}
            ERIS: v${Eris}
            NODE: ${process.version}
            MAIKA: v${version}
        `)
    },
    {
        command: 'uptime',
        description: 'Shows the current uptime for Maika',
        category: 'Generic',
        aliases: [],
        run: (msg) => msg.reply(humanize(Date.now() - msg.bot.startTime))
    }]
});