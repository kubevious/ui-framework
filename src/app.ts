import _ from 'the-lodash'
import { BackendClient } from './backend-client';
import { RemoteTrack } from './remote-track';
import { SharedState } from './shared-state';
import { ServiceInfo, ServiceInitCb, ServiceRegistry } from './service-registry'
import { IService } from '.';
import { HttpClient } from '@kubevious/http-client';

export type SubscribeHandler = ((data: any) => void)

export class Application
{
    private _sharedState = new SharedState();
    private _remoteTrack = new RemoteTrack(this._sharedState);
    private _serviceRegistry = new ServiceRegistry(this._sharedState);
    private _backendClient? : BackendClient;

    constructor()
    {

    }

    get sharedState() : SharedState {
        return this._sharedState;
    }

    get serviceRegistry() : ServiceRegistry {
        return this._serviceRegistry;
    }

    initHttpClient(urlBase?: string)
    {
        this._backendClient = new BackendClient(urlBase, this._remoteTrack);
    }

    httpClient(url: string) : HttpClient
    {
        if (!this._backendClient) {
            throw new Error("HttpClient not initialized. Call [initHttpClient] first.");
        }
        return this._backendClient!.scope(url);
    }

    registerService<T extends IService>(info: ServiceInfo, cb: ServiceInitCb<T>): void
    {
        return this.serviceRegistry.registerService(info, cb);
    }
}