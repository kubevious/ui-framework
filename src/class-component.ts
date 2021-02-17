import { PureComponent } from 'react'
import { IService } from './base-service';
import { ServiceInfo } from './service-registry';
import { ISharedState, SubscribeHandler } from './shared-state';

import { app } from './global'

export class ClassComponent<TProps = {}, TService extends IService = IService> extends PureComponent<TProps> {
    
    private _service?: TService;
    private _sharedState: ISharedState;

    constructor(props: any, serviceInfo?: ServiceInfo) {
        super(props);

        this._sharedState = app.sharedState.user();

        if (serviceInfo) {
            this._service = app.serviceRegistry.resolveService<TService>(serviceInfo);
        }

        console.log('[ClassComponent] ' + this.constructor.name + ' constructor. Props:', props);
    }

    get service() : TService {
        if (!this._service) {
            throw new Error("Service Not Defined");
        }
        return this._service!
    }

    get sharedState() : ISharedState {
        return this._sharedState;
    }

    subscribeToSharedState(subscribers: string | string[], cb: SubscribeHandler): void {
        this._sharedState.subscribe(subscribers, cb);
    }

    componentWillUnmount(): void {
        this._unsubscribeFromSharedState()
    }

    private _unsubscribeFromSharedState(): void {
        this._sharedState.close();
    }
}
