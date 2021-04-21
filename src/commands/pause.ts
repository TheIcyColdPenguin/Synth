import { OwnCommand, as, assertQueueConstruct } from '../constants';

export default as<OwnCommand>({
    name: 'pause',
    aliases: ['|', 'stop'],
    description: 'Pauses playback',
    usage: 'pause',

    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (!queue.playing) {
            return void msg.channel.send('Nothing currently playing');
        }
        if (!queue.connection?.dispatcher) {
            return void msg.channel.send('Something went wrong talking to the voice channel');
        }

        if (queue.playing) {
            queue.connection.dispatcher.pause(true);

            msg.react('🛑');
        }
    },
});
