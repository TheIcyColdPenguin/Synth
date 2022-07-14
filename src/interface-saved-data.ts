import fs, { readFileSync } from 'fs';
import { resolve } from 'path';

import { Message } from 'discord.js';

import { Song } from './constants';
import { createEmbed } from './helpers';

type PlaylistId = number;
interface PlaylistData {
    description: string;
    name: string;
    songs: Song[];
}

class UserData {
    private userDataPath: string;
    private userData: {
        lists: {
            [id: number]: PlaylistData;
        };
        shares: {
            [userId: string]: {
                owned: PlaylistId[];
                referenced: PlaylistId[];
            };
        };
    };

    constructor() {
        this.userDataPath = resolve(__dirname, '..', 'userdata.json');
        this.userData = JSON.parse(readFileSync(this.userDataPath).toString());
        if (!this.userData) {
            // @ts-ignore
            this.userData = {};
        }
        if (!this.userData.lists) {
            this.userData.lists = {};
        }
        if (!this.userData.shares) {
            this.userData.shares = {};
        }
    }

    getPlaylistByName(userId: string, playlistName: string): (PlaylistData & { id: number; owned: boolean }) | null {
        if (!this.userData.shares[userId]) return null;

        const playlists = this.userData.lists;
        const userShares = this.userData.shares[userId];
        playlistName = playlistName.toLowerCase();

        for (const playlistId of userShares.owned) {
            if (playlistName === playlists[playlistId].name.toLowerCase()) {
                return { ...this.userData.lists[playlistId], id: playlistId, owned: true };
            }
        }
        for (const playlistId of userShares.referenced) {
            if (playlistName === playlists[playlistId].name.toLowerCase()) {
                return { ...this.userData.lists[playlistId], id: playlistId, owned: false };
            }
        }

        return null;
    }

    getPlaylistById(playlistId: number): (PlaylistData & { id: number }) | null {
        const playlists = this.userData.lists;

        if (playlists[playlistId]) {
            return { ...playlists[playlistId], id: playlistId };
        }
        return null;
    }

    getAllPlaylistDetails(userId: string): {
        owned: { id: number; name: string; description: string }[];
        referenced: { id: number; name: string; description: string }[];
    } | null {
        if (!this.userData.shares[userId]) return null;

        const userPlaylists = this.userData.shares[userId];
        const playlists = this.userData.lists;

        const owned = userPlaylists.owned.map(id => {
            return { id, name: playlists[id].name, description: playlists[id].description };
        });
        const referenced = userPlaylists.referenced.map(id => {
            return { id, name: playlists[id].name, description: playlists[id].description };
        });

        return { owned, referenced };
    }

    removePlaylist({ userId, playlistName, msg }: { userId: string; playlistName: string; msg?: Message }) {
        const playlist = this.getPlaylistByName(userId, playlistName);
        if (!playlist) {
            return void msg?.channel.send(createEmbed('Playlist not found', 'failure'));
        }

        const playlistType = playlist.owned ? 'owned' : 'referenced';
        this.userData.shares[userId][playlistType] = this.userData.shares[userId][playlistType].filter(
            id => id !== playlist.id
        );

        if (playlist.owned) {
            delete this.userData.lists[playlist.id];

            // remove all references to this playlist
            for (const userId in this.userData.shares) {
                const userShares = this.userData.shares[userId];
                userShares.referenced = userShares.referenced.filter(id => id !== playlist.id);
            }
        }

        this.saveQueue(
            msg,
            playlist.owned ? `Deleted playlist ${playlistName}` : `Removed ${playlistName} from your references`,
            'Could not save changes to playlist.'
        );
    }

    updatePlaylist({
        userId,
        playlistName,
        description,
        songs,
        msg,
    }: {
        userId: string;
        playlistName: string;
        description?: string;
        songs: Song[];
        msg: Message;
    }): void {
        const playlist = this.getPlaylistByName(userId, playlistName);
        if (!playlist) {
            return void msg?.channel.send(createEmbed('Playlist not found', 'failure'));
        }

        if (!playlist.owned) {
            return void msg?.channel.send(createEmbed('You cannot edit a referenced playlist', 'failure'));
        }

        this.userData.lists[playlist.id].songs = songs;

        if (description) {
            this.userData.lists[playlist.id].description = description;
        }

        this.saveQueue(msg, `Updated playlist ${playlistName}`, 'Could not save changes to playlist.');
    }

    createPlaylist({
        userId,
        playlistName,
        songs,
        msg,
        description,
    }: {
        userId: string;
        playlistName: string;
        songs: Song[];
        msg?: Message;
        description?: string;
    }) {
        if (!this.userData.shares[userId]) {
            this.userData.shares[userId] = { owned: [], referenced: [] };
        }

        let playlistId = null;
        do {
            playlistId = Math.floor(Math.random() * 1_000_000_000);
        } while (playlistId === null || this.userData.lists[playlistId]);

        this.userData.lists[playlistId] = {
            name: playlistName,
            songs: songs,
            description: description || '',
        };

        this.userData.shares[userId].owned.push(playlistId);

        this.saveQueue(
            msg,
            `Saved queue ${playlistName}`,
            'You can still import and use the playlist, but if the bot ever restarts, it will not be saved.'
        );
    }

    renamePlaylist({
        userId,
        oldName,
        newName,
        msg,
    }: {
        userId: string;
        oldName: string;
        newName: string;
        msg: Message;
    }) {
        const playlist = this.getPlaylistByName(userId, oldName);
        if (!playlist) {
            return;
        }

        if (!playlist.owned) {
            return void msg.channel.send(
                createEmbed('Failed to rename', 'failure').setDescription(
                    'You cannot rename a playlist that you do not own'
                )
            );
        }
        this.userData.lists[playlist.id].name = newName;
        this.saveQueue(msg, `Renamed playlist ${oldName} to ${newName}`, 'Could not rename playlist');
    }

    referencePlaylist({ playlistId, shareeId, msg }: { playlistId: number; shareeId: string; msg: Message }) {
        const playlist = this.getPlaylistById(playlistId);
        if (!playlist) {
            return void msg.channel.send(createEmbed('Playlist not found', 'failure'));
        }

        if (this.getPlaylistByName(shareeId, playlist.name)) {
            return void msg.channel.send(
                createEmbed('Could not reference playlist', 'failure').setDescription(
                    'You already have a playlist with the same name. Either remove it or rename it.'
                )
            );
        }

        if (!this.userData.shares[shareeId]) {
            this.userData.shares[shareeId] = { owned: [], referenced: [] };
        }

        if (this.userData.shares[shareeId].owned.includes(playlistId)) {
            return void msg.channel.send(
                createEmbed('Could not reference playlist', 'failure').setDescription('You already own this playlist')
            );
        }

        if (this.userData.shares[shareeId].referenced.includes(playlist.id)) {
            return void msg.channel.send(
                createEmbed('Could not reference playlist', 'failure').setDescription(
                    'You already have a reference to this playlist'
                )
            );
        }

        this.userData.shares[shareeId].referenced.push(playlist.id);
        this.saveQueue(msg, `Added ${playlist.name} to your references`, 'Could not share playlist');
    }

    copyPlaylist({
        playlistId,
        shareeId,
        newName,
        msg,
    }: {
        playlistId: number;
        shareeId: string;
        newName: string;
        msg: Message;
    }) {
        const playlist = this.getPlaylistById(playlistId);
        if (!playlist) {
            return void msg.channel.send(createEmbed('Playlist not found', 'failure'));
        }

        if (this.getPlaylistByName(shareeId, newName)) {
            return void msg.channel.send(
                createEmbed('Could not copy playlist', 'failure').setDescription(
                    'You already have a playlist with the same name. Either remove it or rename it.'
                )
            );
        }

        if (!this.userData.shares[shareeId]) {
            this.userData.shares[shareeId] = { owned: [], referenced: [] };
        }

        let newPlaylistId = null;
        do {
            newPlaylistId = Math.floor(Math.random() * 1_000_000_000);
        } while (newPlaylistId === null || this.userData.lists[newPlaylistId]);

        this.userData.lists[newPlaylistId] = {
            name: newName,
            songs: playlist.songs.map(song => ({ ...song })),
            description: playlist.description,
        };
        this.userData.shares[shareeId].owned.push(newPlaylistId);

        // remove references to the playlist since it's going to be copied
        if (this.userData.shares[shareeId].referenced.includes(playlist.id)) {
            this.userData.shares[shareeId].referenced = this.userData.shares[shareeId].referenced.filter(
                id => id !== playlist.id
            );
        }

        this.saveQueue(msg, `Copied playlist ${newName}`, 'Could not copy playlist');
    }

    saveQueue(msg?: Message, successMessageContent?: string, failureMessageContent?: string) {
        fs.writeFile(this.userDataPath, JSON.stringify(this.userData), err => {
            if (err) console.error(err);
            if (!msg) {
                return;
            }

            if (err) {
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
