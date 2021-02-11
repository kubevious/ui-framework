import _ from 'the-lodash'
import { BackendClient } from './backend-client';
import { RemoteTrack } from './remote-track';
import { SharedState } from './shared-state';

export type SubscribeHandler = ((data: any) => void)

export class Application
{
    private _sharedState = new SharedState();
    private _remoteTrack = new RemoteTrack(this._sharedState);

    constructor()
    {

    }

    get sharedState() : SharedState {
        return this._sharedState;
    }

    backendClient(urlBase: string) : BackendClient
    {
        return new BackendClient(urlBase, this._remoteTrack);
    }
}