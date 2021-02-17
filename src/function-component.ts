import React, { FunctionComponent, PropsWithChildren, ReactElement, useEffect } from 'react'; 

import { IService } from './base-service';
import { ServiceInfo } from './service-registry';

import { app } from './global'
import { ISharedState, SubscribeHandler } from './shared-state';

export function useService<TService extends IService>(info: ServiceInfo, cb: (service: TService) => any)
{
    useEffect(() => {
        const service = app.serviceRegistry.resolveService<TService>(info);
        cb(service);
        return () => {
            
        }
    }, [])
}

export function useSharedState(cb: (sharedState: ISharedState) => any)
{
    useEffect(() => {
        const sharedState = app.sharedState.user();
        cb(sharedState);
        return () => {
            sharedState.close();
        }
    }, [])
}

export function subscribeToSharedState(keyOrKeys: string | string[], cb: SubscribeHandler)
{
    useSharedState((sharedState) => {
        sharedState.subscribe(keyOrKeys, cb);
    })
}
