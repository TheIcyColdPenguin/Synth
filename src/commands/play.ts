import ytdl from 'ytdl-core';

import { OwnCommand, as, assertQueueConstruct, Song } from '../constants';
import { createEmbed, getVideoDetails, isUrl, playSong } from '../helpers';

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

        if (newArgs.length === 0) {
            if (!queue.playing || queue.connection?.dispatcher.paused) {
                if (!queue.songs.isEmpty() && queue.songs.size() !== queue.currSong) {
                    // start playing songs
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

            if (isUrl(arg)) {
                try {
                    const isYT = /((https?):\/\/)?www.youtube.com/i;

                    if (!isYT.test(arg)) {
                        return void msg.channel.send(
                            "Sorry, we don't support services other than YouTube at the moment."
                        );
                    }

                    const details = await ytdl.getInfo(arg);

                    return void msg.channel.send(
                        `Name: ${details.videoDetails.title}\n ${details.videoDetails.video_url}`
                    );
                } catch {
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

                    if (!queue.playing) {
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
                }
            }
        }
    },
});
