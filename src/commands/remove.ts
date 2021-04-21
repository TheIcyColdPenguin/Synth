import { OwnCommand, as, assertQueueConstruct } from '../constants';
import { createEmbed } from '../helpers';
import skip from './skip';

export default as<OwnCommand>({
    name: 'remove',
    aliases: ['rm', 'delete', 'd'],
    description: 'Removes the given song from the queue',
    usage: 'remove <song name>',

    cooldown: 3,
    args: true,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        const userInput = args.join('').toLowerCase();
        const songToRemoveIndex = queue.songs
            .getFUllQueue()
            .findIndex(song => song.title.replace(/\W/g, '').toLowerCase().includes(userInput));

        if (songToRemoveIndex === -1) {
            return void msg.channel.send('No songs found');
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
