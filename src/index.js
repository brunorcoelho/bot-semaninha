require('dotenv').config();
require('lastfm').LastFmNode;

const { Client, IntentsBitField, AttachmentBuilder } = require('discord.js');
const { LastFmNode } = require('lastfm');
const Jimp = require('jimp');
const axios = require('axios');
const fs = require('fs');

const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

const lastfm = new LastFmNode({
    api_key: process.env.LASTFM_API, 
    secret: process.env.LASTFM_SECRET,
});

bot.on('ready', (b) => {
    console.log(`${b.user.tag} esta online.`);
});

bot.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'última-track') {
        const username = interaction.options.get('nome-do-usuário').value;
        const stream = lastfm.stream(username);
        stream.start();
        stream.on('lastPlayed', (track) => {
            interaction.reply(`A última track escutada pelo usuário ${username} foi: ${track.name} - ${track.artist['#text']}`);
        });
    }
});

bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'semaninha') {
        const username = interaction.options.get('nome-do-usuário').value;

        await interaction.deferReply();

        lastfm.request('user.getTopAlbums', {
            user: username,
            period: '7day',
            limit: 25,
            handlers: {
                success: async (data) => {
                    const albums = data.topalbums.album;

                    if (albums.length === 0) {
                        await interaction.editReply(`Nenhum álbum encontrado para o usuário ${username} nos últimos 7 dias.`);
                        return;
                    }

                    console.log('\nTop Álbuns para o usuário', username);
                    console.log('------------------------');
                    albums.forEach((album, index) => {
                        console.log(`${index + 1}. ${album.name} - ${album.artist.name}`);
                        console.log(`   Plays: ${album.playcount}`);
                        console.log(`   URL da imagem: ${album.image[3]['#text']}`);
                        console.log('------------------------');
                    });

                    try {
                        const collage = await new Jimp(1000, 1000, '#FFFFFF');
                        for (let i = 0; i < Math.min(albums.length, 25); i++) {
                            const album = albums[i];
                            const imageUrl = album.image[3]['#text'];
                            
                            if (!imageUrl) {
                                console.log(`URL não encontrada para o álbum: ${album.name}`);
                                continue;
                            }

                            try {
                                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                                const imageBuffer = Buffer.from(response.data);
                                const albumArt = await Jimp.read(imageBuffer);
                                
                                const size = 200;
                                const x = (i % 5) * size;
                                const y = Math.floor(i / 5) * size;
                                
                                albumArt.resize(size, size);
                                collage.composite(albumArt, x, y);
                                console.log(`Imagem do álbum ${album.name} adicionada com sucesso a posição (${x}, ${y})`);
                            } catch (err) {
                                console.error(`Erro ao processar a imagem do álbum ${album.name}:`, err.message);
                                continue;
                            }
                        }

                        const filePath = `./collage_${username}.jpg`;
                        await collage.writeAsync(filePath);
                        console.log('Collage salva com sucesso');

                        const attachment = new AttachmentBuilder(filePath);
                        await interaction.editReply({ 
                            content: `Top álbuns dos últimos 7 dias para ${username}:`, 
                            files: [attachment] 
                        });
                        console.log('Collage enviada ao Discord.');

                        fs.unlinkSync(filePath);
                        console.log('Arquivo temporário removido.');

                    } catch (err) {
                        console.error('Ocorreu um erro ao criar o collage:', err);
                        await interaction.editReply('Ocorreu um erro ao criar o collage.');
                    }
                },
                error: async (error) => {
                    console.error('Erro da API do last.fm:', error);
                    await interaction.editReply(`Erro ao buscar os álbuns para o usuário ${username}: ${error.message}`);
                },
            },
        });
    }
});

bot.login(process.env.TOKEN);