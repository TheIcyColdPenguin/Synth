import { OwnCommand, as, assertQueueConstruct } from '../constants';
import { playSong, hasOnlyDigits, createEmbed } from '../helpers';

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

        let num = hasOnlyDigits(args[0]);
        if (!num) {
            return void msg.channel.send(createEmbed('Argument must be greater than 1'));
        }

        queue.connection.dispatcher?.end();
        queue.playing = false;
        queue.lastUsersListeningCheck = Date.now();
        if (queue.currSong !== 0) {
            queue.currSong -= num;
            if (queue.currSong < 0) {
                queue.currSong = 0;
            }
        }
        playSong(msg, queue);
    },
});
