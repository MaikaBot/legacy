const Event = require('../structures/event');

module.exports = class ShardReadyEvent extends Event {
    constructor(bot) {
        super(bot, {
            event: 'shardReady',
            emitter: 'on'
        });
    }

    run(id) {
        this.bot.logger.info(`Shard #${id} is ready!`);
    }
};