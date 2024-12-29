require('dotenv').config();

const { REST, Routes, ApplicationCommandOptionType } = require ('discord.js');

const commands = [
    {
        name: 'semaninha',
        description: 'gera a semaninha do usuário',
        options: [
            {
                name: 'nome-do-usuário',
                description: 'insira seu nome de usuário do last.fm',
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ]
    }
]

const rest = new REST({ version : '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registrando comandos do bot.')
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {body: commands}
        );
        console.log('Comandos registrados com sucesso!')
    } catch (error) {
        console.log(`Ocorreu um erro: ${error}`);    
    }
})();