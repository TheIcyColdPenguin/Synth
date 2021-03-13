import { Client, Collection, Message, VoiceConnection } from 'discord.js';

export interface OwnCommand {
    name: string;
    description: string;
    args?: boolean;
    guildOnly?: boolean;
    voice?: boolean;
    cooldown: number;
    usage: string;
    aliases: string[];
    execute(msg: Message, args: string[], queue?: QueueConstruct): void;
}

export interface CommandClient extends Client {
    commands?: Collection<string, OwnCommand>;
}

export const as = <T>(value: T) => value;

export type Song = { title: string; url: string };

export interface QueueConstruct {
    songs: SongQueue<Song>;
    playing: boolean;
    currSong: number;
    connection: VoiceConnection | null;
}

export const createQueue = (): QueueConstruct => {
    return {
        songs: new SongQueue<Song>(),
        playing: false,
        currSong: 0,
        connection: null,
    };
};

export const assertQueueConstruct = (queue: any, msg: Message): queue is QueueConstruct => {
    const result = queue?.songs !== undefined && queue.songs instanceof SongQueue && queue.playing !== undefined;
    if (!result) {
        msg.channel.send('Something went wrong fetching the queue. Please Try again later');
    }
    return result;
};

export class SongQueue<T> {
    items: T[];

    constructor() {
        this.items = [];
    }

    add(...elem: T[]) {
        this.items.push(...elem);
    }

    shift() {
        if (this.isEmpty()) {
            return;
        }

        return this.items.shift();
    }

    front() {
        return this.items[0];
    }

    getFUllQueue() {
        return [...this.items];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }
}
