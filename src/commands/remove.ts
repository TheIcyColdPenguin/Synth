import { OwnCommand, as, assertQueueConstruct, SongQueue, Song } from '../constants';
import { createEmbed } from '../helpers';
import skip from './skip';

export default as<OwnCommand>({
    name: 'remove',
    aliases: ['rm', 'delete', 'd'],
    description: 'Removes the given song from the queue',
    usage: 'remove <song name | "all">',

    cooldown: 3,
    args: true,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        const userInput = args.join('').toLowerCase();

        let songToRemoveIndex = parseInt(userInput) - 1;
        if (isNaN(songToRemoveIndex)) {
            // check if argument is "all"
            if (userInput === 'all') {
                if (queue.connection?.dispatcher) {
                    queue.connection.dispatcher.end();
                    queue.playing = false;
                    queue.currSong = 0;
                    queue.songs = new SongQueue<Song>();

                    return void msg.channel.send('Cleared queue');
                }
            }

            songToRemoveIndex = queue.songs
                .getFUllQueue()
                .findIndex(song => song.title.replace(/\W/g, '').toLowerCase().includes(userInput));
            if (songToRemoveIndex === -1) {
                return void msg.channel.send('No songs found');
            }
        } else {
            if (songToRemoveIndex < 0 || songToRemoveIndex >= queue.songs.size()) {
                return void msg.channel.send('No song at that position');
            }
        }

        if (queue.currSong > songToRemoveIndex) {
            // song to be removed is already over

            queue.currSong -= 1;
        } else if (queue.currSong === songToRemoveIndex) {
            // song to be removed is currently playing
            skip.execute(msg, [], queue);
            queue.currSong -= 1;
        }

        const songToRemove = queue.songs.items[songToRemoveIndex];

        queue.songs.items.splice(songToRemoveIndex, 1);

        const embed = createEmbed().addField('Removed song', songToRemove.title);
        msg.channel.send(embed);
    },
});
