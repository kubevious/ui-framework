import { HttpClient } from '@kubevious/http-client'
import { AuthorizerCb, HttpClientRetryOptions } from '@kubevious/http-client/dist/http-client';

import { RemoteTrack } from './remote-track';

export interface BackendClientOptions
{
    timeout?: number,
    retry?: HttpClientRetryOptions,
    headers?: Record<string, string>,
    tracker?: RemoteTrack,
    authorizerCb?: AuthorizerCb,
}

export class BackendClient {
    private _client : HttpClient;

    constructor(urlBase?: string, options?: BackendClientOptions)
    {
        options = options || {};
        this._client = new HttpClient(urlBase || '', {
            timeout: options.timeout,
            retry: options.retry,
            headers: options.headers,
            tracker: options.tracker,
            authorizerCb: options.authorizerCb
        })
    }

    scope(url?: string) : HttpClient
    {
        return this._client.scope(url || '');
    }
}
