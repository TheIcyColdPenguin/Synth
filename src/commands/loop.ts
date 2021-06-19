import { OwnCommand, as, assertQueueConstruct, QueueOptions } from '../constants';
import { createEmbed } from '../helpers';

export default as<OwnCommand>({
    name: 'loop',
    aliases: ['repeat'],
    description: 'Loop a song or queue',
    usage: 'loop song|queue',

    voice: true,
    args: true,
    guildOnly: true,
    cooldown: 3,

    execute: async (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        const arg = args[0].trim();
        if (arg === 'song') {
            queue.options = QueueOptions.loopSong;
            msg.channel.send(createEmbed('Now looping'));
        } else if (arg === 'queue') {
            queue.options = QueueOptions.loopQueue;
            msg.channel.send(createEmbed('Now looping queue!'));
        } else {
            msg.channel.send(createEmbed('Unknown option. Use "song" or "queue"', 'failure'));
        }
    },
});
