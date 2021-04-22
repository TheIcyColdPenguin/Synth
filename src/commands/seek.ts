import { OwnCommand, as, assertQueueConstruct } from '../constants';
import { playSong, createEmbed } from '../helpers';

export default as<OwnCommand>({
    name: 'seek',
    aliases: ['mv', 'move'],
    description: `Seek through song. Specify a positive number to skip forward and a negative number to skip back. To move to a specific timestamp, add the 't' flag along with the timestamp in seconds`,
    usage: 'seek < seconds to move | -t <timestamp in seconds> >',

    cooldown: 3,
    voice: true,
    guildOnly: true,
    args: true,

    execute: (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        if (queue.connection && queue.currSongObj) {
            // arg1 can be either a +ve/-ve number or "-t"
            let arg1 = args[0].toLowerCase();
            let arg2 = args[1];

            const maybeSeekOffset = parseInt(arg1);
            const maybeTImeStamp = parseInt(arg2);
            if (!isNaN(maybeSeekOffset)) {
                // the user is trying to seek forward or back
                queue.connection.dispatcher.end();
                queue.playing = false;
                queue.currSongObj = undefined;
                playSong(msg, queue, Math.round(queue.connection.dispatcher.streamTime / 1000) + maybeSeekOffset);
            } else {
                // timestamp mode

                arg1 = arg1.replace(/^-/, '');
                if (arg1 === 't' || arg1 === 'timestamp') {
                    // if timestamp is not given
                    if (isNaN(maybeTImeStamp)) {
                        const embed = createEmbed('The timestamp argument is required');
                        return void msg.channel.send(embed);
                    }

                    queue.connection.dispatcher.end();
                    queue.playing = false;
                    queue.currSongObj = undefined;
                    playSong(msg, queue, Math.round(maybeTImeStamp));
                }
            }
        }
    },
});
