import { v4 as uuidv4 } from 'uuid';
import { ISharedState } from './shared-state';
import { isEmptyObject } from './utils/object-utils';

export class RemoteTrack
{
    private _sharedState: ISharedState
    private _requests: Record<string, RequestInfo> = {};

    constructor(sharedState: ISharedState) {
        this._sharedState = sharedState
    }

    start(action: string, options?: any) : RemoteTrackOperation
    {
        this._sharedState.set('is_loading', true)

        const request = {
            id: uuidv4(),
            options,
            complete: false,
        }

        this._requests[request.id] = request

        console.log(`[REMOTE_TRACK] => ${action}`)

        return {
            request: request.id,

            complete: () => {
                this.detectLoading(request.id)
            },

            fail: (error) => {
                this._sharedState.set('is_error', true)
                this._sharedState.set('error', error)

                this.detectLoading(request.id)
            },
        }
    }

    detectLoading(id: string): void {
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


interface RequestInfo
{
    id: string,
    options: any,
    complete: boolean,
}