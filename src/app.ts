import _ from 'the-lodash'
import { BackendClient } from './backend-client';
import { RemoteTrack } from './remote-track';
import { SharedState } from './shared-state';
import { ServiceInfo, ServiceInitCb, ServiceRegistry } from './service-registry'
import { IService } from '.';

export type SubscribeHandler = ((data: any) => void)

export class Application
{
    private _sharedState = new SharedState();
    private _remoteTrack = new RemoteTrack(this._sharedState);
    private _serviceRegistry = new ServiceRegistry(this._sharedState);

    constructor()
    {

    }

    get sharedState() : SharedState {
        return this._sharedState;
    }

    get serviceRegistry() : ServiceRegistry {
        return this._serviceRegistry;
    }

    backendClient(urlBase: string) : BackendClient
    {
        return new BackendClient(urlBase, this._remoteTrack);
    }

    registerService<T extends IService>(info: ServiceInfo, cb: ServiceInitCb<T>): void
    {
        return this.serviceRegistry.registerService(info, cb);
    }
}