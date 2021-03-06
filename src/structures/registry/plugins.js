/*
 * Copyright (c) 2018-present auguwu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { readdir }    = require('fs');
const { Collection } = require('eris');
const CommandMessage = require('../message');

module.exports = class PluginRegistry {
    /**
     * The plugin registry
     * 
     * @param {import('../client')} bot The bot client
     */
    constructor(bot) {
        this.bot = bot;
        /** @type {Collection<import('../plugin')>} */
        this.plugins = new Collection();
    }

    async setup() {
        readdir('./plugins', (error, files) => {
            if (error)
                this.bot.logger.error(error.stack);
            files.forEach((f) => {
		const mod = require(`../../plugins/${f}`);
                if (!mod.enabled)
                    return;
                this.plugins.set(mod.name, mod);
                this.bot.logger.info(`Loaded plugin: ${mod.name}`);
	    });
        });
    }

    /**
     * Handles of the commands
     * 
     * @param {import('eris').Message} msg The message class
     */
    async handle(msg) {
        if (msg.author.bot || !this.bot.ready)
            return;

        const guild = await this.bot.r.table('guilds').get(msg.channel.guild.id).run();
        const user = await this.bot.r.table('users').get(msg.author.id).run();

        if (!guild)
            return this.bot.r.table('guilds').insert({
                id: msg.channel.guild.id,
                prefix: process.env.MAIKA_PREFIX,
                logging: {
                    enabled: false,
                    channelID: null
                },
                reddit_feed: {
                    enabled: false,
                    channelID: null,
                    subreddit: null
                }
            }).run();
        
        if (!user)
            return this.bot.r.table('users').insert({
                id: msg.author.id,
                coins: 0,
                profile: {
                    description: 'Use the `{{prefix}}profile set description <desc>` to set a description!',
                    social: {
                        osu: null,
                        twitter: null,
                        reddit: null,
                        steam: null
                    }
                },
                marriage: {
                    is: false,
                    to: null
                }
            }).run();

        let prefix;
        const mention = new RegExp(`^<@!?${this.bot.user.id}> `).exec(msg.content);
        let prefixes = [process.env.MAIKA_PREFIX, 'x!', `${mention}`, guild.prefix];

        for (const i of prefixes)
            if (msg.content.startsWith(i))
                prefix = i;

        if (!prefix)
            return;

        const args = msg.content.slice(prefix.length).trim().split(/ +/g);
        const ctx = new CommandMessage(this.bot, { msg, args, prefix });
        const command = args.shift();
        const plugin = this.plugins.filter(s => s.has(command));

        if (plugin.length < 1)
            return;

        const plug = plugin[0].get(command);

        if (plug.guild && msg.channel.type === 1)
            return ctx.reply(`**${ctx.sender.username}**: You must be in a guild to execute the **\`${plug.command}\`** command.`);
        else if (plug.owner && !this.bot.owners.includes(msg.author.id))
            return ctx.reply(`**${ctx.sender.username}**: You must be a developer to execute the **\`${plug.command}\`** command.`);

        try {
            await plug.run(ctx);
        } catch(ex) {
            ctx.reply(`**${ctx.sender.username}**: Command **\`${plug.command}\`** has failed to run.`);
            this.bot.logger.error(require('util').inspect(ex.stack));
        }
    }
};
