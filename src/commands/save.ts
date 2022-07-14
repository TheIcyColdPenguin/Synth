import { OwnCommand, as, assertQueueConstruct } from '../constants';
import { userData } from '../interface-saved-data';

export default as<OwnCommand>({
    name: 'save',
    aliases: ['s'],
    description: 'save your queue',
    usage: 'save <name> [<description>]',

    args: true,
    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (queue.songs.items.length === 0) {
            return msg.channel.send('Cannot save an empty queue');
        }

        if (args[0].trim().includes(' ')) {
            return msg.channel.send('Playlist names cannot contain spaces');
        }

        const description = args[1]?.trim() || '';

        const playlist = userData.getPlaylistByName(msg.author.id, args[0].trim());
        if (!playlist) {
            userData.createPlaylist({
                userId: msg.author.id,
                playlistName: args[0].trim(),
                songs: queue.songs.items,
                description,
                msg,
            });
        } else {
            userData.updatePlaylist({
                userId: msg.author.id,
                playlistName: playlist.name,
                songs: queue.songs.items,
                description: description || playlist.description,
                msg,
            });
        }
    },
});
