import { RequestInfo, ITracker, AxiosResponse, HttpClientError } from '@kubevious/http-client';

import { ISharedState } from './shared-state';
import { isEmptyObject } from './utils/object-utils';


export class RemoteTrack implements ITracker
{
    private _sharedState: ISharedState
    private _requests: Record<string, TrackerRequestInfo> = {};

    constructor(sharedState: ISharedState) {
        this._sharedState = sharedState
    }

    start(requestInfo : RequestInfo)
    {
        console.log('[TRACKER::start] ', requestInfo.method, ' :: ', requestInfo.url);

        this._sharedState.set('is_loading', true)

        this._requests[requestInfo.id] = {
            id: requestInfo.id,
            requestInfo: requestInfo,
            complete: false,
        }
    }

    finish(requestInfo : RequestInfo, response: AxiosResponse)
    {
        console.log('[TRACKER::finish] ', requestInfo.method, ' :: ', requestInfo.url);        
       
        this._detectLoading(requestInfo.id)
    }

    fail(requestInfo : RequestInfo, reason: HttpClientError)
    {
        console.error('[TRACKER::fail] ', requestInfo.method, ' :: ', requestInfo.url , ' :: ', reason.message);
        
        this._sharedState.set('is_error', true)
        this._sharedState.set('error', reason)

        this._detectLoading(requestInfo.id)
    }

    tryAttempt(requestInfo : RequestInfo)
    {
        console.info('[TRACKER::tryAttempt] ', requestInfo.method, ' :: ', requestInfo.url);
    }

    failedAttempt(requestInfo : RequestInfo, reason: HttpClientError)
    {
        console.warn('[TRACKER::fail] ', requestInfo.method, ' :: ', requestInfo.url , ', status:', reason.httpStatusCode);
    }

    private _detectLoading(id: string): void {
        delete this._requests[id];

        if (isEmptyObject(this._requests)) {
            this._sharedState.set('is_loading', false)
        }
    }

}

export interface RemoteTrackOperation
{
    request: string,
    complete: () => void,
    fail: (error: any) => void,
}

interface TrackerRequestInfo
{
    id: string,
    requestInfo : RequestInfo,
    complete: boolean,
}