import { PureComponent } from 'react'
import { IService } from './base-service';
import { ServiceInfo } from './service-registry';
import { ISharedState, SubscribeHandler, Subscriber } from './shared-state';

import { app } from './global'

export class BaseComponent<TService extends IService> extends PureComponent {
    
    private _service: TService;
    private _sharedState: ISharedState;
    private _subscribers: Subscriber[];

    constructor(props: any, serviceInfo: ServiceInfo) {
        super(props);

        this._sharedState = app.sharedState.user();
        this._subscribers = []

        this._service = app.serviceRegistry.resolveService<TService>(serviceInfo);

        console.log('[BaseComponent] ' + this.constructor.name + ' constructor. Props:', props);
    }

    get service() : IService {
        return this._service
    }

    get sharedState() : ISharedState {
        return this._sharedState;
    }

    subscribeToSharedState(subscribers: string, cb: SubscribeHandler): void {
        let subscriber = this._sharedState.subscribe(subscribers, cb);
        this._subscribers.push(subscriber);
    }

    componentWillUnmount(): void {
        this._unsubscribeFromSharedState()
    }

    private _unsubscribeFromSharedState(): void {
        for(let x of this._subscribers) {
            x.close();
        }
        this._subscribers = [];
    }
}
