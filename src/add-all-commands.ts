import play from './commands/play';
import help from './commands/help';
import skip from './commands/skip';
import show from './commands/show';
import pause from './commands/pause';
import remove from './commands/remove';
import previous from './commands/previous';
import exit from './commands/exit';
import save from './commands/save';
import load from './commands/load';
import lists from './commands/lists';
import del from './commands/del';
import reference from './commands/reference';
import clone from './commands/clone';
import loop from './commands/loop';
import shuffle from './commands/shuffle';
import song from './commands/song';
import append from './commands/append';
import seek from './commands/seek';

import { CommandClient } from './constants';

export default (client: CommandClient) => {
    client.commands!.set(play.name, play);
    client.commands!.set(help.name, help);
    client.commands!.set(skip.name, skip);
    client.commands!.set(show.name, show);
    client.commands!.set(pause.name, pause);
    client.commands!.set(remove.name, remove);
    client.commands!.set(previous.name, previous);
    client.commands!.set(exit.name, exit);
    client.commands!.set(save.name, save);
    client.commands!.set(load.name, load);
    client.commands!.set(lists.name, lists);
    client.commands!.set(del.name, del);
    client.commands!.set(reference.name, reference);
    client.commands!.set(loop.name, loop);
    client.commands!.set(shuffle.name, shuffle);
    client.commands!.set(song.name, song);
    client.commands!.set(append.name, append);
    client.commands!.set(clone.name, clone);
    client.commands!.set(seek.name, seek);
};

export const getCommands = () => [
    play,
    help,
    skip,
    show,
    pause,
    remove,
    previous,
    exit,
    save,
    load,
    lists,
    del,
    reference,
    loop,
    shuffle,
    song,
    append,
    clone,
    seek,
];
