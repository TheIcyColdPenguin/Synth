import { OwnCommand, as, assertQueueConstruct } from '../constants';
import { createEmbed } from '../helpers';
import { userData } from '../interface-saved-data';

export default as<OwnCommand>({
    name: 'append',
    aliases: ['extend', 'push'],
    description: 'Adds the current queue to the specified playlist',
    usage: 'append <playlist-name>',

    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (!queue.connection) {
            return void msg.channel.send('Not currently connected to the voice channel');
        }

        const argument = args[0]?.trim();
        if (!argument) {
            return void msg.channel.send(createEmbed('No playlist was provided'));
        }

        if (queue.songs.isEmpty()) {
            return void msg.channel.send(createEmbed('The queue is currently empty'));
        }

        const playlistData = userData.getPlaylist(msg.author.id, argument);
        if (!playlistData) {
            return void msg.channel.send(createEmbed('Playlist not found', 'failure'));
        }

        userData.setPlaylist({
            userId: msg.author.id,
            playlistName: playlistData.name,
            playlist: playlistData.songs.concat(queue.songs.items),
            description: playlistData.description,
            msg,
        });
    },
});
