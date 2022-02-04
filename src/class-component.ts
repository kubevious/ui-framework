import { PureComponent } from 'react'
import { IService } from './base-service';
import { BaseServiceInfo } from './service-registry';
import { ISharedState, SubscribeHandler } from './shared-state';

import { app } from './global'

export class ClassComponent<TProps = {}, TState = {}, TService extends IService = IService, TServiceInfo extends BaseServiceInfo = BaseServiceInfo> extends PureComponent<TProps, TState> {
    
    private _service?: TService;
    private _sharedState: ISharedState;

    constructor(props: Readonly<TProps> | TProps, context?: any, serviceInfo?: TServiceInfo) {
        super(props);
        console.log('[ClassComponent] ' + this.constructor.name + ' constructor. Props:', props);

        this._sharedState = app.sharedState.user();
        if (serviceInfo) {
            console.log('[ClassComponent] ' + this.constructor.name + ', ServiceInfo: ', serviceInfo);
            this._service = app.serviceRegistry.resolveService<TService>(serviceInfo);
        }
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
