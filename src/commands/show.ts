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

        const songsToShow = queue.songs
            .getFullQueue()
            .slice(
                queue.currSong - showQueueSize <= 0 ? 0 : queue.currSong - showQueueSize,
                queue.currSong + showQueueSize
            );

        msg.channel.send(
            createEmbed('Current queue').addFields(
                ...songsToShow.map((song, i) => {
                    const isCurrentSong = queue.currSong === i;
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
