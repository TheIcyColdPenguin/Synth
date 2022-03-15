import { OwnCommand, as, assertQueueConstruct, QueueOptions } from '../constants';
import { createEmbed, millisecondsToTimeStamp, timeStampToSeconds } from '../helpers';

export default as<OwnCommand>({
    name: 'song',
    aliases: ['songs', 'info'],
    description: 'Shows the play time of the current song and total play time remaining',
    usage: 'song',

    voice: true,
    guildOnly: true,
    cooldown: 3,

    execute: async (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }
        if (queue.currSong >= queue.songs.size()) {
            return void msg.channel.send(createEmbed().setDescription('No song currently selected'));
        }
        if (!queue.connection) {
            return void msg.channel.send('Something went wrong talking to the voice channel');
        }

        const song = queue.songs.items[queue.currSong];

        const currSongLengthSeconds = timeStampToSeconds(song.length);
        const currProgressTimeStamp = millisecondsToTimeStamp(queue.connection.dispatcher.streamTime);

        const progressBarLength = 20;
        const progressNum = Math.floor((20 * queue.connection.dispatcher.streamTime) / 1000 / currSongLengthSeconds);

        const progressBar = `|${'•'.repeat(progressNum)}>${'-'.repeat(progressBarLength - progressNum)}|`;

        const embed = createEmbed(song.title)
            .setURL(song.url)
            .setThumbnail(song.thumbnail)
            .setDescription(`${progressBar} ${currProgressTimeStamp}/${song.length}`);
        msg.channel.send(embed);
    },
});
