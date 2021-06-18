import { OwnCommand, as, assertQueueConstruct, SongQueue, Song } from '../constants';
import { createEmbed } from '../helpers';
import { userData } from '../interface-saved-data';
import play from './play';

export default as<OwnCommand>({
    name: 'load',
    aliases: ['s'],
    description: 'load your saved queues',
    usage: 'load <name>',

    args: true,
    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        const songs = userData.getPlaylist(msg.author.id, args[0].trim());

        if (!songs) {
            return void msg.channel.send(createEmbed('That playlist was not found'));
        }

        msg.channel.send(createEmbed(songs.name).setDescription(songs.description || 'Playing now'));

        queue.playing = false;
        queue.currSong = 0;
        queue.songs = new SongQueue<Song>();
        queue.songs.items = songs.songs;
        queue.lastUsersListeningCheck = Date.now();
        play.execute(msg, [], queue);
    },
});
