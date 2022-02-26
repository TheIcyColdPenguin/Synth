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

        let num = hasOnlyDigits(args[0]);
        if (num == false) {
            num = 1;
        } else if (num <= 0) {
            return void msg.channel.send(createEmbed('Argument must be greater than 1'));
        }

        if (queue.connection?.dispatcher) {
            queue.playing = false;
            queue.lastUsersListeningCheck = Date.now();
            queue.connection.dispatcher?.end();
            queue.currSong += num;
            if (queue.currSong > queue.songs.size()) {
                queue.currSong = queue.songs.size();
            }

            if (queue.currSong < queue.songs.size()) {
                playSong(msg, queue);
            }
        }
    },
});
