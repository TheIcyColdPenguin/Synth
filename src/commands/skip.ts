import { OwnCommand, as, assertQueueConstruct } from '../constants';
import { createEmbed, hasOnlyDigits, playSong } from '../helpers';

export default as<OwnCommand>({
    name: 'skip',
    aliases: ['n', 'next'],
    // description: 'skips any number of songs in the queue',
    // usage: 'skip [all | <number of songs to skip>]',
    description: 'skips the current song in the queue',
    usage: 'skip',

    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: async (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (queue.connection) {
            queue.playing = false;
            queue.connection.dispatcher.end();
            queue.currSong += 1;

            msg.channel.send(createEmbed(`Skipped song "${queue.songs.items[queue.currSong - 1].title}"`));

            if (queue.currSong !== queue.songs.size()) {
                playSong(msg, queue);
            }
        }

        // TODO: add a way to skip multiple songs

        // let numToSkip = hasOnlyDigits(args[0] || '');

        // if (numToSkip === false) {
        //     numToSkip = 1;
        // }

        // if (args[0] && args[0].toLowerCase() == 'all') {
        //     numToSkip = queue.songs.size() - queue.currSong;
        // }

        // list all commands
    },
});
