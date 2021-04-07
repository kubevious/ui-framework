import { useEffect, DependencyList, useState } from 'react'; 

import _ from 'the-lodash'

import { IService } from './base-service';
import { ServiceInfo } from './service-registry';

import { app } from './global'
import { ISharedState, SubscribeHandler } from './shared-state';

export type UseServiceCallback<TService> = (service: TService) => (void | (() => void | undefined));
export function useService<TService extends IService>
    (info: ServiceInfo,
     cb?: UseServiceCallback<TService>,
     deps?: DependencyList) : TService | undefined
{
    const [service, setService] = useState<TService>();

    useEffect(() => {
        const myService = app.serviceRegistry.resolveService<TService>(info);
        setService(myService);
        let result : any;
        if (cb) {
            result = cb(myService);
        }
        return () => {
            myService.close();
            setService(undefined);
            if (result) {
                result();
            }
        }
    }, _.isNullOrUndefined(deps) ? [] : deps)

    return service;
}

export type UseSharedStateCallback = (sharedState: ISharedState) => (void | (() => void | undefined));

export function useSharedState
    (cb?: UseSharedStateCallback,
     deps?: DependencyList) : ISharedState | undefined
{
    const [sharedState, setSharedState] = useState<ISharedState>();

    useEffect(() => {
        const mySharedState = app.sharedState.user();
        setSharedState(mySharedState);
        let result : any;
        if (cb) {
            result = cb(mySharedState);
        }
        return () => {
            mySharedState.close();
            setSharedState(undefined);
            if (result) {
                result();
            }
        }
    }, _.isNullOrUndefined(deps) ? [] : deps)

    return sharedState;
}

export function subscribeToSharedState(keyOrKeys: string | string[], cb: SubscribeHandler)
{
    useSharedState((sharedState) => {
        sharedState.subscribe(keyOrKeys, cb);
    })
}
