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

export const createEmbed = (title?: string) => {
    const embed = new MessageEmbed().setColor('b4ded4');
    if (title) {
        embed.setTitle(title);
    }
    return embed;
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
                const combinedData = data.join('');

                const urlSearchPattern = /"videoId"\s*:\s*"(.*?)"/i;
                const titleSearchPattern = /"title":{"runs":\[{"text":"(.*?)"[,}]/i;
                const videoLengthSearchPattern = /"simpletext"\s*:\s*"((\d+:)?\d+:\d+)"/i;
                const videoThumbnailSearchPattern = /"thumbnail"\s*:\s*\{"thumbnails"\s*:\s*\[\{"url"\s*:\s*"(.*?)"/i;

                const vieoUrl = urlSearchPattern.exec(combinedData);
                const videoTitle = titleSearchPattern.exec(combinedData);
                const videoLength = videoLengthSearchPattern.exec(combinedData);
                const videoThumbnail = videoThumbnailSearchPattern.exec(combinedData);

                if (!(vieoUrl && videoTitle && videoLength && videoThumbnail)) {
                    return void reject('The requested video was not found');
                }

                return void resolve({
                    url: `https://www.youtube.com/watch?v=${vieoUrl[1]}`,
                    title: decodeURIComponent(JSON.parse(`"${videoTitle[1]}"`)),
                    length: videoLength[1],
                    thumbnail: videoThumbnail[1],
                });
            });

            res.on('error', e => reject(e));
        });
    });
};

const onFinish = (msg: Message, queue: QueueConstruct) => {
    queue.currSong += 1;
    queue.playing = false;

    if (queue.songs.size() >= queue.currSong) {
        playSong(msg, queue);
    }
};

export const playSong = async (msg: Message, queue: QueueConstruct) => {
    if (!queue.connection) {
        return void msg.channel.send('Error: Disconnected from voice channel');
    }

    if (queue.connection.dispatcher?.paused) {
        queue.connection.dispatcher.resume();
        queue.connection.dispatcher.pause();
        queue.connection.dispatcher.resume();
        queue.playing = true;
        msg.react('➡️');
        return;
    }

    if (queue.playing) {
        return;
    }

    if (queue.currSong >= queue.songs.size() || queue.songs.isEmpty()) {
        queue.currSong = queue.songs.size();
        return;
    }

    const currSongObj = queue.songs.items[queue.currSong];

    queue.playing = true;

    let ytVideo;
    try {
        ytVideo = (await ytdl(currSongObj.url, { quality: 'highestaudio' }))
            .on('finish', () => onFinish(msg, queue))
            .on('error', e => {
                console.log('Something went wrong ', e);
                throw new Error('Something went wrong');
            });
    } catch {
        onFinish(msg, queue);
        return void msg.channel.send('Something went wrong playing the song.');
    }

    const dispatcher = queue.connection.play(ytVideo, { type: 'opus' });
    dispatcher.setVolumeLogarithmic(1);

    const embed = createEmbed(currSongObj.title).setDescription(currSongObj.url);

    if (currSongObj.thumbnail) {
        embed.setImage(currSongObj.thumbnail);
    }

    msg.channel.send(embed);
};

export const hasOnlyDigits = (str: string): number | false => {
    if (typeof str !== 'string') {
        return false;
    }

    return /^\d+$/.test(str) && parseInt(str);
};

export const millisecondsToTimeStamp = (millis: number) => {
    const totalSeconds = Math.round(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString();
    const seconds = (totalSeconds % 60).toString();
    return `${minutes}:${(seconds.length < 2 ? '0' : '') + seconds}`;
};

export const timeStampToSeconds = (timestamp: string) => {};
