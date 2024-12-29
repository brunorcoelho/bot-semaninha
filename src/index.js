require('dotenv').config();
const { Client, IntentsBitField, AttachmentBuilder } = require('discord.js');
const { LastFmNode } = require('lastfm');
const Jimp = require('jimp');
const axios = require('axios');
const fs = require('fs');

const lastfm = new LastFmNode({
  api_key: process.env.LASTFM_API,
  secret: process.env.LASTFM_SECRET,
});

const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

spotifyApi.clientCredentialsGrant().then(
  data => {
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('API do Spotify autenticada com sucesso.');
  },
  err => {
    console.log('Erro ao autenticar com a API do Spotify:', err);
  }
);

const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ]
});

bot.on('ready', (b) => {
  console.log(`O bot ${b.user.tag} está online.`);
});

bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'semaninha') {
    const username = interaction.options.get('nome-do-usuário').value;
    console.log(`O usuário ${interaction.user.username} solicitou a semaninha de ${username}`)
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

          try {
            const collage = await new Jimp(1000, 1000, '#FFFFFF');
            for (let i = 0; i < Math.min(albums.length, 25); i++) {
              const album = albums[i];
              const albumName = album.name;
              const artistName = album.artist.name;

              try {
                const spotifySearch = await spotifyApi.searchAlbums(`${albumName} ${artistName}`, { limit: 1 });

                const spotifyAlbum = spotifySearch.body.albums.items[0];
                const spotifyImageUrl = spotifyAlbum ? spotifyAlbum.images[0].url : null;

                if (!spotifyImageUrl) {
                  console.log(`Imagem não encontrada para o álbum: ${albumName}`);
                  continue;
                }

                try {
                  const response = await axios.get(spotifyImageUrl, { responseType: 'arraybuffer' });
                  const imageBuffer = Buffer.from(response.data);
                  const albumArt = await Jimp.read(imageBuffer);

                  const size = 200;
                  const x = (i % 5) * size;
                  const y = Math.floor(i / 5) * size;

                  albumArt.resize(size, size);
                  collage.composite(albumArt, x, y);
                  console.log(`Imagem do álbum "${albumName} - ${artistName}" adicionada com sucesso a posição (${x}, ${y})`);
                } catch (err) {
                  console.error(`Erro ao processar a imagem do álbum ${albumName}:`, err.message);
                  continue;
                }

              } catch (err) {
                console.error(`Erro ao buscar a imagem do álbum ${albumName} no Spotify:`, err.message);
                continue;
              }
            }

            const filePath = `./collage_${username}.jpg`;
            await collage.writeAsync(filePath);
            console.log('Collage salva com sucesso');

            const attachment = new AttachmentBuilder(filePath);
            await interaction.editReply({
              content: `Top álbuns dos últimos 7 dias para ${username}:`,
              files: [attachment],
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
