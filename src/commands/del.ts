import { OwnCommand, as, assertQueueConstruct, showQueueSize } from '../constants';
import { createEmbed } from '../helpers';
import userData from '../interface-saved-data';

export default as<OwnCommand>({
    name: 'del',
    aliases: ['delete', 'dellist', 'delplaylist', 'deletelist', 'deleteplaylist'],
    description: 'Deletes the specified saved playlist',
    usage: 'del <name>',

    args: true,
    cooldown: 3,
    voice: false,
    guildOnly: false,

    execute: (msg, args) => {
        const allPlaylists = userData.getAllPlaylistDetails(msg.author.id);

        if (!allPlaylists) {
            return void msg.channel.send(createEmbed('You have no saved playlists'));
        }

        if (args.length > 1 || args[0].trim().includes(' ')) {
            return void msg.channel.send(createEmbed('Playlist names cannot contain spaces'));
        }

        userData.removePlaylist({
            userId: msg.author.id,
            playlistName: args[0].trim(),
            msg,
        });
    },
});
