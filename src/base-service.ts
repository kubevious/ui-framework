import _ from 'the-lodash';

import { app } from './global'
import { IClosable } from './types'
export interface IService extends IClosable
{

}

export class BaseService implements IService
{
    private _sharedState = app.sharedState.user();
    private _operationLog = app.operationLog;
    private _resources : IClosable[] = [];

    constructor()
    {
        console.log('[BaseService] ' + this.constructor.name + ' :: create');
        this._resources.push(this._sharedState);
    }

    get sharedState() {
        return this._sharedState;
    }

    get operationLog() {
        return this._operationLog;
    }

    registerResource(closable: IClosable)
    {
        this._resources.push(closable)
    }
    
    close()
    {
        console.log('[BaseService] ' + this.constructor.name + ' :: destroy');

        for(let resource of this._resources)
        {
            resource.close();
        }
        this._resources = [];
    }
}

