import { Resolvable } from 'the-promise';
import { HttpClient, RequestInfo, HttpClientError } from '@kubevious/http-client'
import { AuthorizerCb, HttpClientRetryOptions } from '@kubevious/http-client/dist/http-client';

import { RemoteTrack } from './remote-track';

export interface BackendClientOptions
{
    headers?: Record<string, string>,
    authorizerCb?: AuthorizerCb,
    canRetryCb?: (errorResponse: ErrorResponse, reason: any, requestInfo: RequestInfo) => boolean,
}

export class BackendClient {
    private _client : HttpClient;
    private _options : BackendClientOptions;

    constructor(urlBase?: string, remoteTrack?: RemoteTrack, options?: BackendClientOptions)
    {
        const retry : HttpClientRetryOptions = {
            canContinueCb: this._canContinueCb.bind(this)
        };

        this._options = options || {};

        this._client = new HttpClient(urlBase || '', {
            absorbFailures: true,
            retry: retry,
            headers: this._options.headers,
            tracker: remoteTrack,
            authorizerCb: this._options.authorizerCb
        })
    }

    scope(url?: string) : HttpClient
    {
        return this._client.scope(url || '');
    }

    private _canContinueCb(reason: any, requestInfo: RequestInfo) : Resolvable<boolean>
    {
        const httpError = reason as HttpClientError;
        
        if (httpError?.httpStatusCode === 400) {
            return false;
        } 

        if (this._options.canRetryCb) {
            if (!this._options.canRetryCb!(httpError, reason, requestInfo)) {
                return false;
            }
        }
        
        return true;
    }


}

export interface ErrorResponse extends HttpClientError
{
}