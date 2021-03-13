import play from './commands/play';
import help from './commands/help';
import skip from './commands/skip';

import { CommandClient } from './constants';

export default (client: CommandClient) => {
    client.commands!.set(play.name, play);
    client.commands!.set(help.name, help);
    client.commands!.set(skip.name, skip);
};

export const getCommands = () => [help, play, skip];
