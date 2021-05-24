import { OwnCommand, as, assertQueueConstruct } from '../constants';
import { playSong } from '../helpers';

export default as<OwnCommand>({
    name: 'previous',
    aliases: ['prev', 'back'],
    description: 'track to previous song',
    usage: 'prev',

    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (!queue.connection?.dispatcher) {
            return void msg.channel.send('Something went wrong talking to the voice channel');
        }

        queue.connection.dispatcher.end();
        queue.playing = false;
        if (queue.currSong !== 0) {
            queue.currSong--;
        }
        playSong(msg, queue)
    },
});
