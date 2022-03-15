import { OwnCommand, as, assertQueueConstruct, showQueueSize } from '../constants';
import { createEmbed } from '../helpers';
import play from './play';

export default as<OwnCommand>({
    name: 'show',
    aliases: ['q', 'queue', 'display'],
    description: 'Displays the current queue',
    usage: 'show',

    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (args.length !== 0) {
            return void play.execute(msg, args, queue);
        }

        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (!queue.connection) {
            return void msg.channel.send('Not currently connected to the voice channel');
        }

        if (queue.songs.isEmpty()) {
            return void msg.channel.send(createEmbed('The queue is currently empty'));
        }

        const sideLength = Math.floor(showQueueSize / 2);
        const nearBeginning = queue.currSong - sideLength <= 0;
        const startIndex = nearBeginning ? 0 : queue.currSong - sideLength;
        const endIndex = queue.currSong + sideLength + 1 - (nearBeginning ? queue.currSong - sideLength : 0);
        const songsToShow = queue.songs.getFullQueue().slice(startIndex, endIndex);

        msg.channel.send(
            createEmbed('Current queue').addFields(
                ...songsToShow.map((song, i) => {
                    const isCurrentSong = queue.currSong === startIndex + i;
                    return [
                        {
                            name: isCurrentSong ? '-> ' + song.title : song.title,
                            value: song.length,
                            inline: false,
                        },
                    ];
                })
            )
        );
    },
});
