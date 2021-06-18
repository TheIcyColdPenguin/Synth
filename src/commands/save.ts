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

        userData.setPlaylist({
            userId: msg.author.id,
            playlistName: args[0].trim(),
            playlist: queue.songs.items,
            description: args[1]?.trim() || '',
            msg,
        });
    },
});
