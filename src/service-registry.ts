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
    private _servicesDict: Record<string, ServiceItem<IService, {}>> = {};

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
        
        const svcInfo : ServiceItem<TService, TServiceInfo> = {
            kind: info.kind,
            info: info,
            cb: cb,
            services: {}
        };
        this._servicesDict[svcInfo.kind] = <ServiceItem<IService, {}>>(<any>svcInfo);
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

        const mySvcInfo = <ServiceItem<TService, TServiceInfo>>(<any>svcInfo);

        let newService = mySvcInfo.cb({
            info, 
            sharedState: this.sharedState
        });

        if (!newService) {
            throw new Error(`Could not resolve service ${info.kind}`);
        }

        svcInfo.services[key] = newService;
        return newService;
    }

}

export type ServiceInfo<TServiceInfo = {}> = {
    kind: string 
} & TServiceInfo;

interface ServiceItem<TService extends IService, TServiceInfo = {}>
{
    kind: string,
    info: ServiceInfo,
    cb: ServiceInitCb<TService, TServiceInfo>,
    services: Record<string, IService>
};