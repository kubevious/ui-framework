import _ from "the-lodash";
import { ISharedState } from './shared-state';
import { IService } from './base-service';

export interface ServiceInitParams<TServiceInfo> {
    info: TServiceInfo,
    sharedState: ISharedState
}

export type ServiceInitCb<TService extends IService, TServiceInfo = {}> = (params: ServiceInitParams<TServiceInfo>) => TService;

export class ServiceRegistry
{
    private _sharedState: ISharedState
    private _servicesDict: Record<string, ServiceItem> = {};

    constructor(sharedState: ISharedState)
    {
        this._sharedState = sharedState;
        this._servicesDict = {};
    }

    get sharedState() {
        return this._sharedState;
    }
    
    get serviceKinds() {
        return _.keys(this._servicesDict);
    }

    registerService<TService extends IService, TServiceInfo = {}>(info: { kind: string }, cb: ServiceInitCb<TService, TServiceInfo>): void
    {
        if (!info.kind) {
            throw new Error("Service kind not set");
        }
        
        const svcInfo : ServiceItem = {
            kind: info.kind,
            info: info,
            cb: cb,
            services: {}
        };
        this._servicesDict[svcInfo.kind] = svcInfo;
    }

    closeServicesByKind(kind: string): void
    {
        const svcInfo = this._servicesDict[kind];
        if (svcInfo) {
            for(let service of _.values(svcInfo.services))
            {
                service.close()
            }
            svcInfo.services = {};
        }
    }

    resolveService<TService extends IService, TServiceInfo = {}>(info: ServiceInfo<TServiceInfo>): TService | never
    {
        if (!info.kind) {
            throw new Error("Service kind not set");
        }

        const svcInfo = this._servicesDict[info.kind];
        if (!svcInfo) {
            throw new Error("Unknown service: " + info.kind);
        }
        
        const key: string = _.stableStringify(info);
        if (key in svcInfo.services) {
            let svc = svcInfo.services[key];
            return <TService>svc;
        }

        let commonService = svcInfo.cb({
            info, 
            sharedState: this.sharedState
        });

        if (!commonService) {
            throw new Error(`Could not resolve service ${info.kind}`);
        }

        let service = <TService>commonService;
        svcInfo.services[key] = service;
        return service;
    }

}

export type ServiceInfo<TServiceInfo = {}> = {
    kind: string 
} & TServiceInfo;

interface ServiceItem
{
    kind: string,
    info: ServiceInfo,
    cb: ServiceInitCb<IService>,
    services: Record<string, IService>
};