import { Message } from 'discord.js';
import { OwnCommand, as } from '../constants';
import { getCommands } from '../add-all-commands';
import { createEmbed } from '../helpers';

export default as<OwnCommand>({
    name: 'help',
    aliases: ['h'],
    description: 'Provides details on available commands',
    usage: 'help [all | command]',

    cooldown: 3,

    execute: async (msg: Message, args: string[]) => {
        const allCommands = getCommands();

        if (args.length === 0 || args[0].toLowerCase() == 'all') {
            // list all commands

            const embed = createEmbed('Help -').addFields(
                ...allCommands.map(command => [
                    {
                        name: command.name[0].toUpperCase() + command.name.slice(1),
                        value: command.description,
                        inline: true,
                    },
                ])
            );

            msg.channel.send(embed);
        } else {
            // only list required copmmands

            for (const arg of args) {
                const command = allCommands.find(
                    maybeCommand =>
                        maybeCommand.name === arg.toLowerCase() || maybeCommand.aliases.includes(arg.toLowerCase())
                );

                if (!command) {
                    continue;
                }

                const embed = createEmbed().addFields(
                    { name: command.name[0].toUpperCase() + command.name.slice(1), value: command.description },
                    { name: 'Usage', value: command.usage },
                    { name: 'Cooldown', value: `${command.cooldown} seconds` },
                    { name: 'Aliases', value: command.aliases.join(', ') }
                );

                await msg.channel.send(embed);
            }
        }
    },
});
