import { HttpClient } from '@kubevious/http-client'

import { RemoteTrack } from './remote-track';

export class BackendClient {
    private _client : HttpClient;

    constructor(urlBase?: string, remoteTrack?: RemoteTrack)
    {
        this._client = new HttpClient(urlBase || '', {
            tracker: remoteTrack
        })
    }

    scope(url: string) : HttpClient
    {
        return this._client.scope(url);
    }
}
