import { OwnCommand, as } from '../constants';
import { createEmbed } from '../helpers';
import { userData } from '../interface-saved-data';

export default as<OwnCommand>({
    name: 'share',
    aliases: ['copy'],
    description: 'share your saved queues with others',
    usage: 'share <name> @user',

    args: true,
    cooldown: 3,
    voice: false,
    guildOnly: true,

    execute: (msg, args, queue) => {
        const playlist = userData.getPlaylist(msg.author.id, args[0].trim());

        if (!playlist) {
            return void msg.channel.send(createEmbed('That playlist does not exist').setColor('#cc6962'));
        }

        msg.mentions.users.array().forEach(user => {
            if (userData.getPlaylist(user.id, playlist.name)) {
                return void msg.channel.send(
                    `${user} already has a playlist called ${playlist.name}, skipping for now`
                );
            }
            userData.setPlaylist({
                msg,
                userId: user.id,
                playlistName: playlist.name,
                description: playlist.description,
                playlist: playlist.songs,
            });
        });
    },
});
