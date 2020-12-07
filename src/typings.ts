export interface Config {
    address: string
    port: number
    initialState?: any,
    maxClients?: number,
    maxRoomMetadataLength?: number,
    maxUserIdLength?: number,
    lobbyBroadcastInterval?: number,
    roomsBroadcastInterval?: number
}

export enum MOSHPIT_CLIENT_ACTION {
    ACTIONS = 0,
    CREATE_ROOM = 1,
    JOIN_ROOM = 2,
    LEAVE_ROOM = 3,
    LOGIN = 4
}

export enum MOSHPIT_SERVER_ACTION {
    STATE_PATCH = 1, // payload => room diff
    LOBBY = 2, // payload => lobby
    LOBBY_PATCH = 3, // payload => lobby diff
    CREATE_ROOM_SUCCEED = 4, // payload => roomId
    CREATE_ROOM_FAILED = 5,
    JOIN_ROOM_SUCCEED = 6, // paylaod => room state
    JOIN_ROOM_FAILED = 7,
    LEAVE_ROOM_SUCCEED = 8
}

export type MoshpitClientMessage = [MOSHPIT_CLIENT_ACTION, any];
export type MoshpitServerMessage = [MOSHPIT_SERVER_ACTION, any];
export type Reducer<T, U> = (state: T, action: U, userId: string) => T;