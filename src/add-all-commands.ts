import play from './commands/play';
import help from './commands/help';
import skip from './commands/skip';
import show from './commands/show';
import pause from './commands/pause';
import remove from './commands/remove';
import seek from './commands/seek';

import { CommandClient } from './constants';

export default (client: CommandClient) => {
    client.commands!.set(play.name, play);
    client.commands!.set(help.name, help);
    client.commands!.set(skip.name, skip);
    client.commands!.set(show.name, show);
    client.commands!.set(pause.name, pause);
    client.commands!.set(remove.name, remove);
    client.commands!.set(seek.name, seek);
};

export const getCommands = () => [help, play, skip, show, pause, remove, seek];
