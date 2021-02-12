import _ from "the-lodash";
import { ISharedState } from './shared-state';
import { IService } from './base-service';

export interface ServiceInitParams {

}

export type ServiceInitCb<T extends IService> = (params: ServiceInitParams) => T;

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

    registerService<T extends IService>(info: ServiceInfo, cb: ServiceInitCb<T>): void
    {
        if (!info.kind) {
            throw new Error("Service kind not set");
        }
        
        const svcInfo : ServiceItem = {
            info: info,
            cb: cb,
            services: {}
        };
        this._servicesDict[info.kind] = svcInfo;
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

    resolveService<T extends IService>(info: ServiceInfo): T | never
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
            return <T>svc;
        }

        let commonService = svcInfo.cb({
            info, 
            sharedState: this.sharedState,
            parent: this
        });

        if (!commonService) {
            throw new Error(`Could not resolve service ${info.kind}`);
        }

        let service = <T>commonService;
        svcInfo.services[key] = service;
        return service;
    }

}

export interface ServiceInfo
{
    kind: string 
}

interface ServiceItem
{
    info: ServiceInfo,
    cb: ServiceInitCb<IService>,
    services: Record<string, IService>
};