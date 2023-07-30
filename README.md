# RUiNEd, an RPG adventure for a party of 1-4 players

## Background
RUiNEd was created in 10 days for the 2023 ReactJam (https://reactjam.com/).  
RUiNEd uses React to render the game, and uses the Rune games SDK for multiplayer logic, state management, and lobbies.

## Playing RUiNEd
Once approved, RUiNEd will be avaiable within the Rune app the App Store and Google Play.  
You can start a game or join an existing one.  
In RUiNEd, you move from room to room with your party. Each room has
a different theme. In some rooms, you'll find treasure. In others, you'll
gain runes that make you more powerful. There are also rooms filled 
with monsters that must be defeated in combat.  

## Deployment
For local testing:  

    git clone https://github.com/lusmattg/RUiNEd.git
    npm install
    npm run dev

To deploy to production, please refer to [the official documentation for Rune](https://developers.rune.ai/docs/publishing/publishing-your-game)

## Contributing
The current version of RUiNEd was made quickly under a time limit. The engine and content are both messy and incomplete. Future tasks include:

- Add Healing spells
- Make defense stat matter
- Fix sporadic desync issues
- Add a longer dungeon beyond the tutorial
- Complex effects on items & powers
- Timed buffs/debuffs
- Add more items, spells, and enemies

## Credits
Game author: lusmattg (https://github.com/lusmattg)  
Special thanks to Midjourney for AI-generated game art  
Copyright 2023 lusmattg, all rights reserved.  