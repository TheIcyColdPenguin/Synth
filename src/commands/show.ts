import { OwnCommand, as, assertQueueConstruct, showQueueSize } from '../constants';
import { createEmbed, millisecondsToTimeStamp, timeStampToSeconds } from '../helpers';
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

        const finishedTime = millisecondsToTimeStamp(
            1000 *
                (queue.songs
                    .getFullQueue()
                    .slice(0, queue.currSong)
                    .reduce((acc, curr) => acc + timeStampToSeconds(curr.length), 0) +
                    queue.connection.dispatcher?.streamTime / 1000)
        );
        const totalTime = millisecondsToTimeStamp(
            1000 * queue.songs.getFullQueue().reduce((acc, curr) => acc + timeStampToSeconds(curr.length), 0)
        );

        const numSongs = queue.songs.items.length;

        msg.channel.send(
            createEmbed('Current queue')
                .setFooter(
                    `Queue Completion: ${finishedTime}/${totalTime}
Song Completion: ${queue.currSong + 1 > numSongs ? numSongs : queue.currSong + 1}/${numSongs}`
                )
                .addFields(
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
