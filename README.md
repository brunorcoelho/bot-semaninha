# Last.fm Discord Bot

This is a Discord bot that interacts with Last.fm API to fetch and display the user's most played tracks and albums over the past week. It can send a collage of the user's top albums in the last 7 days to the Discord channel.

## Features

- **Get the most recent track**: Fetch the last played track by a specific user.
- **Top albums in the last 7 days**: Generate and send a collage of the top 25 albums played by a user in the last 7 days.
- **Display album details**: Shows album name, artist name, and album cover.

## Prerequisites

Before you can use the bot, you'll need:

- [Node.js](https://nodejs.org/) (v16.x or higher recommended)
- A Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))
- Last.fm API Key and Secret (from [Last.fm API](https://www.last.fm/api))

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/brunorcoelho/bot-semaninha.git
cd bot-semaninha
```

### 2. Install dependencies

Run the following command to install all required packages:

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root of your project and add the following variables:

```env
TOKEN=YOUR_DISCORD_BOT_TOKEN
GUILD_ID=YOUR_DISCORD_SERVER_ID
CLIENT_ID=YOUR_DISCORD_ID
LASTFM_API=YOUR_LASTFM_API_KEY
LASTFM_SECRET=YOUR_LASTFM_API_SECRET
```

Replace `YOUR_DISCORD_BOT_TOKEN`, `YOUR_DISCORD_SERVER_ID` `YOUR_DISCORD_ID` with your Discord credentials,`YOUR_LASTFM_API_KEY` and `YOUR_LASTFM_API_SECRET` with the credentials from Last.fm.

### 4. Start the bot

To start the bot, run:

```bash
node src/index.js
```

The bot should now be online and respond to commands in your Discord server.

## Commands

### `/semaninha`
Generates and sends a collage of the top 25 albums played in the last 7 days by a specific user.

**Usage**:
```bash
/semaninha nome-do-usuário: [username]
```

Example:
```bash
/semaninha nome-do-usuário: bruno090904
```

## Development

- If you want to test the bot on your local machine, just run `node src/index.js` after making your changes.
- If you make any changes to the bot's commands or interactions, you will need to update your Discord bot permissions.

## Troubleshooting

### Common Errors

1. **Missing environment variables**:
   - Ensure that your `.env` file contains the correct API credentials.
   - If you're missing any required variables, the bot may fail to start.

2. **Rate limits**:
   - Last.fm imposes rate limits on their API. Make sure to handle retries or adjust the frequency of API calls if you hit a rate limit.

3. **Bot not responding**:
   - Double-check that your bot has the necessary permissions to read and send messages in your Discord server.