import _ from 'the-lodash'
import { BackendClient, BackendClientOptions } from './backend-client';
import { RemoteTrack } from './remote-track';
import { OperationLogTracker } from './operation-log-tracker';
import { SharedState } from './shared-state';
import { ServiceInitCb, ServiceRegistry, BaseServiceInfo } from './service-registry'
import { IService } from '.';
import { HttpClient } from '@kubevious/http-client';

export type SubscribeHandler = ((data: any) => void)

export class Application
{
    private _sharedState = new SharedState();
    private _remoteTrack = new RemoteTrack(this._sharedState);
    private _operationLogTracker = new OperationLogTracker(this._sharedState);
    private _serviceRegistry = new ServiceRegistry(this._sharedState);
    
    private _backendClients : Record<string, BackendClient> = {};

    constructor()
    {

    }

    get sharedState() : SharedState {
        return this._sharedState;
    }

    get serviceRegistry() : ServiceRegistry {
        return this._serviceRegistry;
    }
    get operationLog() : OperationLogTracker {
        return this._operationLogTracker;
    }

    initHttpClient(scope: any, urlBase?: string, options?: BackendClientOptions) : void
    {
        const key = this._httpClientKey(scope);

        const client = new BackendClient(urlBase, this._remoteTrack, options);
        this._backendClients[key] = client;
    }

    httpClient(scope: any, url: string) : HttpClient
    {
        const key = this._httpClientKey(scope);
        const client = this._backendClients[key];

        if (!client) {
            console.error("[App::httpClient] Missing HttpClient. Key: ", scope)
            throw new Error("HttpClient not found.");
        }
        return client.scope(url);
    }

    private _httpClientKey(scope: any)
    {
        scope = scope || {};
        return _.stableStringify(scope);
    }

    registerService<TService extends IService, TServiceInfo extends BaseServiceInfo = BaseServiceInfo>
        (info: BaseServiceInfo, cb: ServiceInitCb<TService, TServiceInfo>): void
    {
        return this.serviceRegistry.registerService(info, cb);
    }
}