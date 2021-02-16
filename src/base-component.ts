import React, { PureComponent } from 'react'
import { IService } from './base-service';
import { ServiceInfo } from './service-registry';
import { ISharedState, SubscribeHandler, Subscriber } from './shared-state';

import { app } from './global'

export type Props = {
    id?: string
    kind?: string
    request?: RequestList
    handleChangeWindow?: (e: React.ChangeEvent<HTMLInputElement>) => void
    windows?: any
    diagramSource?: any
    handleLayout?: (value: any) => void
    title?: string
    config?: any
    extraClassTitle?: string
    extraClassContents?: string
    dn?: string
    dnKind?: string
    groupName?: string
    group?: any
    propertyExpanderHandleClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export type RequestList = {
    kind: string
    id?: string
    name?: string
    questions?: Question[]
    title?: string
    content?: string
    version?: string
    url?: string
    changes?: string[]
    features?: string[]
    request?: RequestList
}

export type Question = {
    id: string
    kind: string
    text: string
    options?: string[]
    optional?: boolean
}

export class BaseComponent<TService extends IService> extends PureComponent<Props> {
    
    private _service?: TService;
    private _sharedState: ISharedState;
    private _subscribers: Subscriber[];

    constructor(props: any, serviceInfo?: ServiceInfo) {
        super(props);

        this._sharedState = app.sharedState.user();
        this._subscribers = []

        if (serviceInfo) {
            this._service = app.serviceRegistry.resolveService<TService>(serviceInfo);
        }

        console.log('[BaseComponent] ' + this.constructor.name + ' constructor. Props:', props);
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
