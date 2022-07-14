import { OwnCommand, as } from '../constants';
import { createEmbed } from '../helpers';
import { userData } from '../interface-saved-data';

export default as<OwnCommand>({
    name: 'get',
    aliases: ['ref', 'reference'],
    description: 'Listen to what other people have saved',
    usage: 'get <id>',

    args: true,
    cooldown: 3,
    voice: false,
    guildOnly: true,

    execute: (msg, args, queue) => {
        const maybeId = Number(args[0]);

        if (isNaN(maybeId)) {
            return void msg.channel.send(
                createEmbed('Could not reference playlist').setDescription('The ID must be a number')
            );
        }

        userData.referencePlaylist({ msg, playlistId: maybeId, shareeId: msg.author.id });
    },
});
