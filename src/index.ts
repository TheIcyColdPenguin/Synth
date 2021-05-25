import { Client, Collection, User } from 'discord.js';

import { token, prefix } from './config.json';
import { CommandClient, QueueConstruct, createQueue } from './constants';

// actual bot

const client: CommandClient = new Client();
client.commands = new Collection();

const cooldowns = new Collection<string, Collection<string, number>>();
const queues = new Collection<string, QueueConstruct>();

// commands

import addAllCommands from './add-all-commands';
addAllCommands(client);

// on startup

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag || 'Synth'}`);
});

client.on('message', msg => {
    if (msg.author.bot || !msg.content.startsWith(prefix)) return;

    const args = msg.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase() || '';

    if (!client.commands) {
        return void msg.channel.send("We're having difficulties getting commands right now. Please try again later");
    }

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases.includes(commandName));

    if (!command) {
        return;
    }

    /**
     * * check guild only
     */

    {
        if (command.guildOnly && msg.channel.type === 'dm') {
            return void msg.reply("I can't execute that command inside DMs!");
        }
    }

    /**
     * * check voice
     */

    if (command.voice) {
        // check if user is in a voice channel

        const voiceChannel = msg.member?.voice.channel;

        if (!voiceChannel) {
            return void msg.reply('You must be in a voice channel to execute this command!');
        }

        // check if bot is allowed to use it

        const permissions = voiceChannel.permissionsFor(msg.client.user as User);

        if (!(permissions?.has('CONNECT') && permissions.has('SPEAK'))) {
            return void msg.reply('The bot does not have the right permissions!');
        }
    }

    /**
     * * check args
     */

    {
        if (command.args && args.length == 0) {
            return void msg.channel.send(`No arguments specified\nUsage: ${command.usage}`);
        }
    }

    /**
     * * check cooldowns
     */

    {
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name)!;
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(msg.author.id)) {
            const expirationTime = timestamps.get(msg.author.id)! + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return void msg.channel.send(
                    `Please wait \`${timeLeft.toFixed(1)}\` more second(s) before reusing the \`${
                        command.name
                    }\` command.`
                );
            }
        }

        timestamps.set(msg.author.id, now);
        setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
    }

    /**
     * * finally run the actual command
     */

    try {
        if (command.voice) {
            let serverQueue = queues.get(msg.guild!.id);

            if (!serverQueue) {
                queues.set(msg.guild!.id, createQueue());
                serverQueue = queues.get(msg.guild!.id);
            }

            if (!serverQueue) {
                return void msg.channel.send('Something went terribly wrong. Please contect the bot author');
            }

            command.execute(msg, args, serverQueue);
        } else {
            command.execute(msg, args);
        }
    } catch (error) {
        console.error(error);
        msg.channel.send('Something went wrong. Please try again later');
    }
});

setInterval(() => {
    const now = Date.now();
    const timeoutTime = 1000 * 60 * 5;
    for (const queue of queues.array()) {
        if (queue.connection?.channel.members.size !== 1) {
            return;
        }

        if (now - queue.lastUsersListeningCheck > timeoutTime) {
            queue.connection.dispatcher.end();
            queue.connection.channel.leave();
            queue.playing = false;
        }
    }
}, 5000);

client.login(token);
