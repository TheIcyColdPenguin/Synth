import { OwnCommand, as, assertQueueConstruct, SongQueue, Song } from '../constants';

export default as<OwnCommand>({
    name: 'exit',
    aliases: ['x', 'leave'],
    description: 'exit voice channel',
    usage: 'exit',

    cooldown: 3,
    voice: true,
    guildOnly: true,

    execute: (msg, args, queue) => {
        // ! DO NOT USE msg in execute as it may be called without a valid Message object

        if (!queue) {
            return;
        }

        if (queue.playing) {
            queue.connection?.dispatcher?.end();
        }
        queue.playing = false;
        queue.currSong = 0;
        queue.lastUsersListeningCheck = Date.now();
        queue.connection?.dispatcher?.end();
        queue.connection?.disconnect();
        queue.connection?.channel.leave();
        queue.connection = null;
        queue.songs = new SongQueue<Song>();
    },
});
