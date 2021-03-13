import { MessageEmbed } from 'discord.js';
import { OwnCommand, as, assertQueueConstruct, showQueueSize } from '../constants';

export default as<OwnCommand>({
    name: 'show',
    aliases: ['q', 'queue', 'display'],
    description: 'skips the current song in the queue',
    usage: 'skip',

    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: async (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (queue.songs.isEmpty()) {
            return void msg.channel.send(new MessageEmbed().setTitle('The queue is currently empty'));
        }

        const songsToShow = queue.songs
            .getFUllQueue()
            .slice(
                queue.currSong - showQueueSize <= 0 ? 0 : queue.currSong - showQueueSize,
                queue.currSong + showQueueSize
            );
        const embed = new MessageEmbed().setTitle('Queue-').addFields(
            songsToShow.map(song => {
                return {
                    name: song.title,
                    value: song.length,
                    inline: true,
                };
            })
        );

        msg.channel.send(embed);
    },
});
