import React, { FunctionComponent, PropsWithChildren, ReactElement, useEffect, DependencyList } from 'react'; 

import _ from 'the-lodash'

import { IService } from './base-service';
import { ServiceInfo } from './service-registry';

import { app } from './global'
import { ISharedState, SubscribeHandler } from './shared-state';

export type UseServiceCallback<TService> = (service: TService) => (void | (() => void | undefined));

export function useService<TService extends IService>(info: ServiceInfo, cb: UseServiceCallback<TService>, deps?: DependencyList)
{
    if (_.isNullOrUndefined(deps)) {
        deps = [];
    }
    useEffect(() => {
        const service = app.serviceRegistry.resolveService<TService>(info);
        const result = cb(service);
        return () => {
            service.close();
            if (result) {
                result();
            }
        }
    }, deps)
}

export type UseSharedStateCallback = (sharedState: ISharedState) => (void | (() => void | undefined));

export function useSharedState(cb: UseSharedStateCallback, deps: DependencyList = []) : void
{
    if (_.isNullOrUndefined(deps)) {
        deps = [];
    }
    useEffect(() => {
        const sharedState = app.sharedState.user();
        const result = cb(sharedState);
        return () => {
            sharedState.close();
            if (result) {
                result();
            }
        }
    }, deps)
}

export function subscribeToSharedState(keyOrKeys: string | string[], cb: SubscribeHandler)
{
    useSharedState((sharedState) => {
        sharedState.subscribe(keyOrKeys, cb);
    }, [])
}
