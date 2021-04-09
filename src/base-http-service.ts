import _ from 'the-lodash';
import { HttpClient } from '@kubevious/http-client'
import { BaseService } from './base-service' 

export class BaseHttpService extends BaseService
{
    private _client: HttpClient;

    constructor(client: HttpClient)
    {
        super()

        this._client = client;

        if (!this._client) {
            throw new Error("Client not provided");
        }
    }

    public get client() {
        return this._client;
    }
}