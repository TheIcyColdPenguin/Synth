import { OwnCommand, as, assertQueueConstruct, showQueueSize } from '../constants';
import { createEmbed } from '../helpers';
import userData from '../interface-saved-data';

export default as<OwnCommand>({
    name: 'lists',
    aliases: ['playlists', 'list', 'playlist', 'saved'],
    description: 'Displays your saved playlists. If you specify a name, it will show the contents of that playlist',
    usage: 'lists [<name>]',

    cooldown: 3,
    voice: false,
    guildOnly: false,

    execute: (msg, args) => {
        const argument = args[0]?.trim();
        if (argument) {
            const playlistData = userData.getPlaylist(msg.author.id, argument);

            if (!playlistData) {
                return void msg.channel.send(createEmbed('Playlist not found').setColor('#cc6962'));
            }

            const embed = createEmbed(playlistData.name).addFields(
                playlistData.songs.map(song => ({
                    name: song.title,
                    value: song.length,
                    inline: false,
                }))
            );

            if (playlistData.description) {
                embed.setDescription(playlistData.description);
            }

            return void msg.channel.send(embed);
        }

        const allPlaylists = userData.getAllPlaylists(msg.author.id);

        if (!allPlaylists || allPlaylists.length===0) {
            return void msg.channel.send(createEmbed('You have no saved playlists'));
        }

        msg.channel.send(
            createEmbed('Your saved playlists').addFields(
                allPlaylists.map(playlist => ({
                    name: playlist.name,
                    value: playlist.description || 'No description provided',
                    inline: false,
                }))
            )
        );
    },
});