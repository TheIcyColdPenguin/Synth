import { OwnCommand, as, assertQueueConstruct, SongQueue, Song } from '../constants';
import { playSong } from '../helpers';

export default as<OwnCommand>({
    name: 'seek',
    aliases: ['mv', 'sk', 'move'],
    description: 'seeks to a position in the song',
    usage: 'seek time [absolute | a]',

    cooldown: 3,
    args: true,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (!queue.connection?.dispatcher) {
            return void msg.channel.send('Unable to connect to voice channel');
        }

        const time = parseInt(args[0]);
        const relativeOrAbsolute = args[1].toLowerCase() || 'relative';

        if (!Number.isInteger(time)) {
            return void msg.reply('Invalid timestamp, please enter a valid integer');
        }

        let absoluteTimeStamp = time;

        if (relativeOrAbsolute === 'relative' || relativeOrAbsolute === 'r') {
            absoluteTimeStamp += Math.floor(queue.connection.dispatcher.streamTime / 1000);
        }

        queue.connection.dispatcher?.end();
        queue.playing = false;
        queue.lastUsersListeningCheck = Date.now();
        playSong(msg, queue, absoluteTimeStamp);
    },
});
