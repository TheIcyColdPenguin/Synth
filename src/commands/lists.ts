import { OwnCommand, as } from '../constants';
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
            const playlistData = userData.getPlaylistByName(msg.author.id, argument);

            if (!playlistData) {
                return void msg.channel.send(createEmbed('Playlist not found', 'failure'));
            }

            const embed = createEmbed(`${playlistData.name} - ${playlistData.id}`)
                .setFooter(`${playlistData.songs.length} songs`)
                .addFields(
                    playlistData.songs.slice(0, 20).map(song => ({
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

        const allPlaylists = userData.getAllPlaylistDetails(msg.author.id);

        if (!allPlaylists || allPlaylists.owned.length + allPlaylists.referenced.length === 0) {
            return void msg.channel.send(createEmbed('You have no saved playlists'));
        }

        const embed = createEmbed('Your saved playlists');

        if (allPlaylists.owned.length > 0) {
            embed.addField('Owned Playlists', '\u200b').addFields(
                allPlaylists.owned.map(playlist => {
                    const fullPlaylist = userData.getPlaylistById(playlist.id)!;
                    return {
                        name: playlist.name,
                        value: `${fullPlaylist.id} - ${playlist.description || 'No description provided'}
${fullPlaylist.songs ? `${fullPlaylist.songs.length} songs` : ''}`,
                        inline: false,
                    };
                })
            );
        }

        if (allPlaylists.referenced.length > 0) {
            embed.addField('Referenced Playlists', '\u200b').addFields(
                allPlaylists.referenced.map(playlist => {
                    const fullPlaylist = userData.getPlaylistById(playlist.id)!;
                    return {
                        name: playlist.name,
                        value: `${fullPlaylist.id} - ${playlist.description || 'No description provided'}
${fullPlaylist.songs ? `${fullPlaylist.songs.length} songs` : ''}`,
                        inline: false,
                    };
                })
            );
        }

        msg.channel.send(embed);
    },
});
