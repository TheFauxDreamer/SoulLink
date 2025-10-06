# Pokémon Soul Link Tracker

A web-based Pokémon soul link tracker! Supports generations 1-7 games.

Playing a Soul Link Nuzlocke with a friend? Trying to work out how on earth you'll keep track of the routes, Pokémon, if they've fainted, what gym you're up to, the current level cap, and what the optimal team is?

You're in the right place!

Try it out: https://soullink--laughing-lichterman-c3b6ff.netlify.app

## What it does

- **Tracks soul links automatically** - pairs your Pokémon and enforces all the rules
- **Duplicate protection** - won't let you catch duplicate types or evolution families  
- **Gym progress tracking** - knows every gym leader and shows your current level cap
- **Team suggestions** - not sure if you can have a full team of 6? We can check in a click
- **Generation validation** - only shows Pokémon that exist in your chosen game
- **Streamer mode** - clean overlay window for streaming your run
- **Import/export** - save your progress as a file to backup or share
- **Strict mode** - sick of poor coverage with old 1 type between both teams? Turn it off
- **Shiny support** - you caught a shiny on your run? Totally legit?... you can show the shiny sprite variant!
- **Mix & Match Generations** - select any base game, with any combination of pokemon gens from 1-9
- **Custom ROM Hack Support** - playing a completely custom ROM hack game? We now support fakemon, sprits, routes etc!

## How it works

Pick your generation & game, add Pokémon as you catch them, and it handles the rest. Click to add a soul link to your team and it'll warn you about rule violations. When a Pokémon faints, its soul link partner gets removed automatically and keeps track.

Works with every major Pokémon game from Red/Blue through Ultra Sun/Moon, with all the routes and gym leaders you'd expect.

This is in development and being worked on in my free time. There is no server, so your teams are saved to browser, but you can export (recommended after each session) for safe keeping or to transfer between PCs!

## ROM Hack Support

This data is saved to browser so you only have to upload the CSV once. It's not included in the export because you can just keep the CSVs safe somewhere.

CSV templates for the following custom data are available from the website itself.
- Gyms/Elite Four/Level Caps
- Routes
- Fakemon/Evolutions
- Fakemon Sprites hosted online

Look it's not the greatest, _I know_.
But I only play like Emerald Seaglass and so I'm not overly fussed. If you've got a better idea for implementing this please hit me up. Don't know if you could do something crazy cool like upload the ROM and read its contents?
