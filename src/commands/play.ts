import ytdl from 'ytdl-core';
import ytpl from 'ytpl';

import { OwnCommand, as, assertQueueConstruct, Song } from '../constants';
import { createEmbed, getVideoDetails, isUrl, millisecondsToTimeStamp, playSong } from '../helpers';

export default as<OwnCommand>({
    name: 'play',
    aliases: ['p', 'resume', 'a', 'append', 'add'],
    description: 'Play a song/playlist or add to the queue if a song is currently playing',
    usage: 'play [song/playlist search term or url]',

    voice: true,
    guildOnly: true,
    cooldown: 1,

    execute: async (msg, args, queue) => {
        if (!assertQueueConstruct(queue, msg)) {
            return;
        }

        const newArgs = args
            .join(' ')
            .split(/\s*,\s*/)
            .filter(arg => arg.trim());

        const voiceChannel = msg.member?.voice.channel;

        if (!voiceChannel) {
            return void msg.channel.send('Something went wrong with the voice channel. Please contact the bot author');
        }

        // no arguments were given, so just play the song if possible
        if (newArgs.length === 0) {
            if (!queue.playing || queue.connection?.dispatcher?.paused) {
                if (!queue.songs.isEmpty() && queue.songs.size() !== queue.currSong) {
                    // start playing songs
                    queue.lastUsersListeningCheck = Date.now();
                    playSong(msg, queue);
                } else if (queue.songs.isEmpty() || queue.songs.size() === queue.currSong) {
                    msg.channel.send('Please add songs to the queue to play!');
                }
                return;
            }
        }

        if (queue.songs.size() > 5000) {
            return void msg.channel.send('You have reached the max queue size!');
        }

        for (let i = 0; i < newArgs.length; i++) {
            const arg = newArgs[i];

            // if it's a url
            // if it's not a youtube url, return early
            // check if it's a playlist in which case add it to the queue
            // if it's a video, add to queue
            if (isUrl(arg)) {
                try {
                    const isYT = /((https?):\/\/)?(www\.)?youtube\.com/i;

                    const isVideoRegex = /v=([a-zA-Z_\-]{8,})/;
                    const isPlaylistRegex = /list=([a-zA-Z0-9_\-]{8,})/;
                    // INFO: minimum of 8 characters is arbitrary

                    if (!isYT.test(arg)) {
                        return void msg.channel.send(
                            "Sorry, we don't support services other than YouTube at the moment."
                        );
                    }

                    const isPlaylist = arg.match(isPlaylistRegex);
                    if (isPlaylist) {
                        const playlistDetails = await ytpl(isPlaylist[1]);

                        playlistDetails.items.forEach(async (video, i) => {
                            const eachPlaylistVideodetails = await ytdl.getInfo(video.shortUrl);

                            if (!video.duration || !video.durationSec) {
                                return void msg.channel.send(
                                    `The video ${video.title} from the given playlist was not found, skipping...`
                                );
                            }

                            queue.songs.add({
                                title: eachPlaylistVideodetails.videoDetails.title,
                                url: video.shortUrl,
                                length: video.duration || millisecondsToTimeStamp(video.durationSec * 1000),
                            });

                            if (!queue.playing && i === 0) {
                                if (!queue.connection?.dispatcher) {
                                    queue.connection = await voiceChannel.join();
                                    playSong(msg, queue);
                                }
                            }
                        });
                        const embed = createEmbed(`Added playlist ${playlistDetails.title}`);
                        return void msg.channel.send(embed);
                    }

                    const details = await ytdl.getInfo(arg);

                    return void msg.channel.send(
                        `Name: ${details.videoDetails.title}\n ${details.videoDetails.video_url}`
                    );
                } catch (e) {
                    console.log(e);
                    return void msg.channel.send(`${arg} - something went wrong`);
                }
            } else {
                let video: Song;
                try {
                    video = await getVideoDetails(arg);
                } catch (e) {
                    console.error(e);
                    return void msg.channel.send('Something went wrong fetching video details. Please try again later');
                }

                // add song to queue

                {
                    queue.songs.add(video);

                    if (!queue.playing && queue.currSong === queue.songs.getFullQueue().length - 1) {
                        // start playing song
                        try {
                            queue.connection = await voiceChannel.join();

                            playSong(msg, queue);
                        } catch (e) {
                            console.log(e);
                            return void msg.channel.send(
                                'Something went wrong playing a song. Please check with the bot author'
                            );
                        }
                    } else {
                        let embed = createEmbed(`Added ${video.title} to queue!`);
                        msg.channel.send(embed);
                    }
                    queue.lastUsersListeningCheck = Date.now();
                }
            }
        }
    },
});
