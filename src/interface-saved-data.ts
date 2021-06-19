import fs, { readFileSync } from 'fs';
import { resolve } from 'path';

import { Message } from 'discord.js';

import { Song } from './constants';
import { createEmbed } from './helpers';

const userdatapath = resolve(__dirname, '..', 'userdata.json');

const userdata = JSON.parse(readFileSync(userdatapath).toString());

interface PlaylistData {
    description: string;
    name: string;
}
interface FullPlaylistData extends PlaylistData {
    songs: Song[];
}

class UserData {
    private userData: {
        [userId: string]: {
            [playlistName: string]: FullPlaylistData;
        };
    };

    constructor() {
        this.userData = userdata;
    }

    getPlaylist(userId: string, playlistName: string): FullPlaylistData | null {
        playlistName = playlistName.toLowerCase();
        return this.userData[userId]?.[playlistName] || null;
    }

    getAllPlaylists(userId: string): PlaylistData[] | null {
        const userPlaylists = this.userData[userId];
        if (!userPlaylists) {
            return null;
        }

        return Object.keys(userPlaylists).map(userPlaylist => {
            return { name: userPlaylist, description: userPlaylists[userPlaylist].description };
        });
    }

    removePlaylist({ userId, playlistName, msg }: { userId: string; playlistName: string; msg?: Message }) {
        if (!this.userData[userId]) {
            return;
        }

        if (!this.userData[userId][playlistName]) {
            return void msg?.channel.send(createEmbed(playlistName, 'failure').setDescription('Playlist not found'));
        }

        delete this.userData[userId][playlistName];

        this.saveQueue(
            msg,
            `Deleted playlist ${playlistName}`,
            'Could not save changes to playlist. The correct changes have been applied temporarily but if the bot ever restarts, this change will not be preserved.'
        );
    }

    setPlaylist({
        userId,
        playlistName,
        playlist,
        msg,
        description,
    }: {
        userId: string;
        playlistName: string;
        playlist: Song[];
        msg?: Message;
        description?: string;
    }) {
        if (!this.userData[userId]) {
            this.userData[userId] = {};
        }

        if (Object.keys(this.userData[userId]).length >= 10 && !this.userData[userId][playlistName]) {
            if (msg) {
                msg.channel.send(createEmbed('You have reached the limit of 10 saved playlists', 'failure'));
            }
            return;
        }

        this.userData[userId][playlistName.toLowerCase()] = {
            name: playlistName,
            songs: playlist,
            description: description || '',
        };

        this.saveQueue(
            msg,
            `Saved queue ${playlistName}`,
            'You can still import and use the playlist, but if the bot ever restarts, it will not be saved.'
        );
    }

    saveQueue(msg?: Message, successMessageContent?: string, failureMessageContent?: string) {
        fs.writeFile(userdatapath, JSON.stringify(this.userData), err => {
            if (!msg) {
                return;
            }

            if (err) {
                console.log(err);
                const embed = createEmbed('There was an error saving the queue.', 'failure');

                if (failureMessageContent) {
                    embed.setDescription(failureMessageContent);
                }

                msg.channel.send(embed);
            } else {
                if (successMessageContent) {
                    msg.channel.send(createEmbed().setDescription(successMessageContent));
                }
            }
        });
    }
}

export const userData = new UserData();
export default userData;
