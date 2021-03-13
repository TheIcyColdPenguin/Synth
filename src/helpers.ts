import { Message, MessageEmbed } from 'discord.js';
import ytdl from 'ytdl-core-discord';
import https from 'https';
import { QueueConstruct, Song } from './constants';

const YT_SEARCH_URL = 'https://www.youtube.com/results?search_query=';

export const isUrl = (str: string) => {
    if (!str.startsWith('https://' || !str.startsWith('http://'))) return false;

    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
};

export const getVideoDetails = (searchTerm: string): Promise<Song> => {
    return new Promise((resolve, reject) => {
        const searchQuery = encodeURIComponent(searchTerm);

        https.get(YT_SEARCH_URL + searchQuery, res => {
            let data: string[] = [];

            // A chunk of data has been received.
            res.on('data', chunk => {
                data.push(chunk);
            });

            res.on('end', () => {
                const urlSearchPattern = /"videoId"\s*:\s*"(.*?)"/i;
                const titleSearchPattern = /"(title|text)"\s*:\s*"(.*?)"/i;

                const vieoUrl = urlSearchPattern.exec(data.join(''));
                const videoTitle = titleSearchPattern.exec(data.join(''));

                if (!vieoUrl || !videoTitle) {
                    return void reject('The requested video was not found');
                }

                return void resolve({
                    url: `https://www.youtube.com/watch?v=${vieoUrl[1]}`,
                    title: decodeURIComponent(JSON.parse(`"${videoTitle[2].replace('"', '\\"')}"`)),
                });
            });

            res.on('error', e => reject(e));
        });
    });
};

const onFinish = (msg: Message, queue: QueueConstruct) => {
    console.log('ran from onFinish');
    console.log('\n\nQUEUE\n\n', queue.currSong);
    console.log(queue.playing);
    console.log(queue.currSong);
    console.log(queue.songs);

    queue.currSong += 1;
    queue.playing = false;

    if (queue.songs.size() >= queue.currSong) {
        playSong(msg, queue);
    }
};

export const playSong = async (msg: Message, queue: QueueConstruct) => {
    if (queue.playing) {
        return;
    }

    if (queue.currSong >= queue.songs.size() || queue.songs.isEmpty()) {
        queue.currSong = queue.songs.size();
        return;
    }

    if (!queue.connection) {
        return void msg.channel.send('Error: Disconnected from voice channel');
    }

    const currSongObj = queue.songs.items[queue.currSong];

    queue.playing = true;
    const dispatcher = queue.connection.play(
        (await ytdl(currSongObj.url, { quality: 'highestaudio' }))
            .on('finish', () => onFinish(msg, queue))
            .on('error', e => {
                console.log('Something went wrong ', e);
                throw new Error('Something went wrong');
            }),
        { type: 'opus' }
    );
    dispatcher.setVolumeLogarithmic(1);

    const embed = new MessageEmbed().setTitle(currSongObj.title).setColor('b4ded4').setDescription(currSongObj.url);

    msg.channel.send(embed);
};

export const hasOnlyDigits = (str: string): number | false => {
    if (typeof str !== 'string') {
        return false;
    }

    return /^\d+$/.test(str) && parseInt(str);
};
