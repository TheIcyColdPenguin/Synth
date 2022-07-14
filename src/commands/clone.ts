import { OwnCommand, as } from '../constants';
import { createEmbed } from '../helpers';
import { userData } from '../interface-saved-data';

export default as<OwnCommand>({
    name: 'clone',
    aliases: ['copy'],
    description: 'Make your own copy of a playlist',
    usage: 'clone <id> [<name>]',

    args: true,
    cooldown: 3,
    voice: false,
    guildOnly: true,

    execute: (msg, args, queue) => {
        const maybeId = Number(args[0]);
        const maybeNewName: string | undefined = args[1]?.trim();

        if (!maybeNewName) {
            return void msg.channel.send(
                createEmbed('Could not clone playlist').setDescription('You must provide a name for the new playlist')
            );
        }

        if (maybeNewName.includes(' ')) {
            return msg.channel.send(createEmbed('Playlist names cannot contain spaces'));
        }

        if (isNaN(maybeId)) {
            return void msg.channel.send(
                createEmbed('Could not reference playlist').setDescription('The ID must be a number')
            );
        }

        userData.copyPlaylist({
            msg,
            playlistId: maybeId,
            shareeId: msg.author.id,
            newName: maybeNewName,
        });
    },
});
