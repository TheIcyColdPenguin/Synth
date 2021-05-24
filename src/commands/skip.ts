import { OwnCommand, as, assertQueueConstruct } from '../constants';
import { createEmbed, hasOnlyDigits, playSong } from '../helpers';

export default as<OwnCommand>({
    name: 'skip',
    aliases: ['n', 'next'],
    description: 'Skips the current song in the queue',
    usage: 'skip',

    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (queue.connection?.dispatcher) {
            queue.playing = false;
            queue.connection.dispatcher.end();
            queue.currSong += 1;

            if (queue.currSong !== queue.songs.size()) {
                playSong(msg, queue);
            }
        }

    },
});
