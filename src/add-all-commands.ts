import play from './commands/play';
import help from './commands/help';
import skip from './commands/skip';
import show from './commands/show';

import { CommandClient } from './constants';

export default (client: CommandClient) => {
    client.commands!.set(play.name, play);
    client.commands!.set(help.name, help);
    client.commands!.set(skip.name, skip);
    client.commands!.set(show.name, show);
};

export const getCommands = () => [help, play, skip, show];
