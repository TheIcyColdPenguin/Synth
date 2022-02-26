import { OwnCommand, as, assertQueueConstruct } from '../constants';
import { createEmbed, shuffleArray } from '../helpers';
import show from './show';

export default as<OwnCommand>({
    name: 'shuffle',
    aliases: ['mix'],
    description: 'Shuffles the remaining portion of the queue',
    usage: 'shuffle',

    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        const songs = queue.songs.getFullQueue();
        const lowerHalf = songs.slice(queue.currSong + 1);
        shuffleArray(lowerHalf);
        queue.songs.items = songs.slice(0, queue.currSong + 1).concat(lowerHalf);

        msg.channel.send(createEmbed('Shuffled queue!'));
        
        if (queue.connection?.dispatcher) {
            queue.lastUsersListeningCheck = Date.now();
        }

        show.execute(msg, [], queue)
    },
});
