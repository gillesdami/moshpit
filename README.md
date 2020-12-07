# Moshpit

Minimalist multiplayer game state sync for fast game development

## Features

- The easiest api
- Lobby
  - lightweight state synchronisation over WebSocket
  - subscribe to lobby updates
  - min synchronisation time interval
  - room metadata (room title for example)
- Room
  - lightweight state synchronisation over WebSocket
  - min synchronisation time interval
  - max client per room
  - private rooms
  - reconnection

Not included:

- direct messaging beetween peers
- synchronisation over multiple servers
- matchmaking

If you are looking for those features please consider [colyseus](https://github.com/colyseus/colyseus/), I wont implement them has they make everything more complex.

## Example

TODO

## Config

The configuration object takes the following parameters:

- address: string                   The server address
- port: number                        The server port
- initialState?: any                  The initial state of newly created rooms. Default: {}.
- maxClients?: number                 The max number of client per room. Default: Infinity.
- maxRoomMetadataLength?: number      The max lenght of the metada string. Default: 1024.
- maxUserIdLength?: number            The max length of the userId. Default: 1024.
- lobbyBroadcastInterval?: number     The minimal time interval between two lobby state updates in ms. Default: 500.
- roomsBroadcastInterval?: number     The minimal time interval between two room state updates in ms. Default: 50.

## License

MIT
