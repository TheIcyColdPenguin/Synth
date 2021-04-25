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

        // blue
        // const lines: string[] = ['```ini'];
        const lines: string[] = ['```diff'];

        songsToShow.forEach((song, i) => {
            const isCurrentSong = queue.currSong === i;

            const maxLength = 76;
            const requiredWhitespace = maxLength - song.title.length - song.length.length;

            lines.push(
                `${isCurrentSong ? '+' : ' '} ${song.title}${Array(
                    requiredWhitespace < 0 ? 0 : requiredWhitespace
                ).join(' ')}${song.length}`
            );
        });
        lines.push('```');

        msg.channel.send(lines.join('\n'));
    },
});
