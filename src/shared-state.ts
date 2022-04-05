import _ from 'the-lodash'
import { v4 as uuidv4 } from 'uuid';

export type GlobalSubscribeHandler = (() => void)
export type SubscribeHandler = ((data: any) => void)

export class SharedState implements ISharedState
{
    private _debugOutput : boolean = true;
    private _isScheduled : boolean = false;
    private _lastValues : Record<string, any> = {};
    private _values : Record<string, any> = {};
    private _globalSubscribers : Record<string, InternalGlobalSubscriber> = {};
    private _subscribers : Record<string, InternalSubscriber> = {};
    private _subscribedKeys : Record<string, Record<string, boolean> > = {};
    private _metadata : Record<string, SharedFieldMetadata> = {};
    private _skipPersistence = false;

    constructor()
    {
        console.log("[SharedState] CONSTRUCTOR");
    }

    get keys() : string[]
    {
        return _.keys(this._values);
    }

    register(name: string, options?: SharedFieldOptions)
    {
        const metadata = this._makeMetadata(options)
        this._metadata[name] = metadata;
    }

    init()
    {
        this._loadPersistedValues();
    }

    close()
    {
        throw new Error("Close functionality works for user scoped shared state objects.");
    }

    user() : ISharedState
    {
        const scopedSharedState = new SharedStateScope(this);
        return scopedSharedState;
    }

    /*
     * Subscribes to changes of key value. Supports multiple key subscription.
     * Usage:
     * state.subscribe("key1", (value) => {
            console.log('Key1 VALUE CHANGED: ');
            console.log(value);
       })
     * Usage:
     * state.subscribe(["key1", "key2"], ({key1, key2}) => {
            console.log('Key1 or Key2 VALUEs CHANGED: ');
            console.log(key1);
            console.log(key2);
       })
    */
    subscribe(keyOrKeys: string | string[], cb: SubscribeHandler) : Subscriber
    {
        const subscriber : InternalSubscriber = {
            id: uuidv4(),
            handler: cb,
            isArray: _.isArray(keyOrKeys),
            keys: _.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
        }

        this._subscribers[subscriber.id] = subscriber;

        for(const key of subscriber.keys) {
            if (!this._subscribedKeys[key]) {
                this._subscribedKeys[key] = {}
            }
            this._subscribedKeys[key][subscriber.id] = true;
        }

        this._notifyToSubscriber(subscriber.id);
        
        return {
            id: subscriber.id,
            close: () => {
                delete this._subscribers[subscriber.id];
            }
        };
    }

    onChange(cb: GlobalSubscribeHandler) : Subscriber
    {
        const subscriber : InternalGlobalSubscriber = {
            id: uuidv4(),
            handler: cb,
        }

        this._globalSubscribers[subscriber.id] = subscriber;

        cb();
        
        return {
            id: subscriber.id,
            close: () => {
                delete this._globalSubscribers[subscriber.id];
            }
        };
    }

    tryGet<T = any>(name: string) : T | null
    {
        const value = this._values[name];
        if (_.isNullOrUndefined(value)) {
            return null;
        }
        return value as T;
    }

    get<T = any>(name: string, defaultValue: T) : T
    {
        const value = this.tryGet(name);
        if (_.isNullOrUndefined(value)) {
            return defaultValue;
        }
        return value as T;
    }

    set(name: string, value: any)
    {
        const metadata = this._getMetadata(name);

        if (!metadata.skipCompare)
        {
            if (_.fastDeepEqual(value, this._values[name]))
            {
                return;
            }
        }

        if (this._debugOutput)
        {
            if (metadata.skipValueOutput) {
                console.log("[SharedState] SET " + name + ". Value Output Skipped.");
            } else {
                let str = JSON.stringify(value);
                if (str) {
                    if (str.length > 80) {
                        str = str.substring(0, 80) + '...';
                    }
                }
                console.log("[SharedState] SET " + name + " = " + str);
            }
        }

        if (_.isNullOrUndefined(value)) {
            delete this._values[name];
        } else {
            this._values[name] = value;
        }

        if (metadata.persistence) {
            this._processPersistence(name, value, metadata.persistence);
        }

        this._trigger();
    }

    markUserFlag(name: string, flag: string)
    {
        const dict = this._getDict(name);
        dict[flag] = true;
        this.set(name, dict);
    }

    clearUserFlag(name: string, flag: string)
    {
        const dict = this._getDict(name);
        delete dict[flag];
        this.set(name, dict);
    }

    isUserPresent(name: string)
    {
        const dict = this._getDict(name);
        return (_.keys(dict).length > 0);
    }

    private _getDict(name: string)
    {
        const dict = this.get<Record<string, boolean>>(name, {})!;
        return _.clone(dict);
    }
    
    private _loadPersistedValues()
    {
        try
        {
            this._skipPersistence = true;

            const searchParams = new URLSearchParams(window.location.search);

            for(const name of _.keys(this._metadata))
            {
                const metadata = this._getMetadata(name);
                if (metadata.persistence)
                {
                    this._loadPersistentValue(searchParams, name, metadata.persistence)
                }
            }
        }
        finally
        {
            this._skipPersistence = false;
        }
    }

    private _loadPersistentValue(searchParams: URLSearchParams, name: string, persistence: SharedFieldPersistenceOptions)
    {
        if (persistence.kind === 'url')
        {
            const rawValue = searchParams.get(persistence.key);
            this._applyPersistentValue(name, rawValue, persistence);
            return;
        }

        if (persistence.kind === 'local-storage')
        {
            const rawValue = localStorage.getItem(persistence.key);
            this._applyPersistentValue(name, rawValue, persistence);
            return;
        }
    }

    private _applyPersistentValue(name: string, rawValue: string | null, persistence: SharedFieldPersistenceOptions)
    {
        if (_.isNullOrUndefined(rawValue)) {
            this.set(name, null);
            return;
        }

        try
        {
            let value : any = rawValue;

            if (persistence.deserialize) {
                value = persistence.deserialize(value!);
            } else {
                if (persistence.base64 || persistence.json)
                {
                    value = atob(value)
                }
    
                if (persistence.json) {
                    value = JSON.parse(value)
                }
            }

            this.set(name, value);
        }
        catch(reason)
        {
            console.error(reason);
            return;
        }
    }

    private _processPersistence(name: string, value: any, persistence: SharedFieldPersistenceOptions)
    {
        if (this._skipPersistence) {
            return;
        }
        
        if (persistence.kind === 'url')
        {
            const searchParams = new URLSearchParams(window.location.search);
            if (_.isNullOrUndefined(value)) {
                searchParams.delete(persistence.key)
            } else {
                searchParams.set(persistence.key, this._getPersistentValue(value, persistence));
            }

            let url = "";
            url += window.location.pathname;
            const searchParamsStr = searchParams.toString();
            if (searchParamsStr) {
                url += '?' + searchParamsStr;
            }

            window.history.pushState(window.history.state, window.document.title, url);
            return;
        }

        if (persistence.kind === 'local-storage')
        {
            if (_.isNullOrUndefined(value)) {
                localStorage.removeItem(persistence.key)
            } else {
                localStorage.setItem(persistence.key, this._getPersistentValue(value, persistence));
            }
            return;
        }
    }

    private _getPersistentValue(value: any, persistence: SharedFieldPersistenceOptions)
    {
        let rawValue = value;

        if (persistence.serialize) {
            rawValue = persistence.serialize(rawValue);
        } else {
            if (persistence.json) {
                rawValue = _.stableStringify(rawValue);
            } else {
                rawValue = _.toString(rawValue);
            }

            if (persistence.base64 || persistence.json)
            {
                rawValue = btoa(rawValue)
            }
        }

        return rawValue;
    }

    private _trigger()
    {
        if (this._isScheduled) {
            return;
        }
        this._isScheduled = true;
        setTimeout(() => {
            this._isScheduled = false;
            this._process();
        }, 0)
    }

    private _process()
    {
        const diff : Record<string, boolean> = {};

        {
            for(const name of _.keys(this._values))
            {
                const value = this._values[name];
                const lastValue = this._lastValues[name];

                if (!_.fastDeepEqual(value, lastValue))
                {
                    diff[name] = true;
                }
            }
        }

        {
            for(const name of _.keys(this._lastValues))
            {
                const value = this._values[name];
                if (_.isNullOrUndefined(value)) {
                    diff[name] = true;
                }
            }
        }
        
        const subscriberIDs : Record<string, boolean> = {};
        for(const name of _.keys(diff))
        {
            if (this._subscribedKeys[name])
            {
                for(const id of _.keys(this._subscribedKeys[name]))
                {
                    subscriberIDs[id] = true;
                }
            }
        }

        this._lastValues = _.cloneDeep(this._values);

        for(const id of _.keys(subscriberIDs))
        {
            this._notifyToSubscriber(id);
        }

        if (_.keys(this._globalSubscribers).length > 0) 
        {
            for(const globalSubscriber of _.values(this._globalSubscribers))
            {
                globalSubscriber.handler();
            }
        }
    }

    private _notifyToSubscriber(id: string)
    {
        const subscriber = this._subscribers[id];
        const argsArray : any[] = [];

        if (!subscriber)
        {
            return;
        }

        if (subscriber.isArray)
        {
            const dict : Record<string, any> = {};
            for(const name of subscriber.keys)
            {
                const value = this.tryGet(name);
                dict[name] = value;
            }
            argsArray.push(dict);
        }
        else
        {
            const value = this.tryGet(subscriber.keys[0]);
            argsArray.push(value);
        }

        // console.log("[SharedState] Trigger " + id + " :: " + JSON.stringify(argsArray));
        subscriber.handler.apply(null, <any>argsArray);
    }

    private _makeMetadata(options?: SharedFieldOptions) : SharedFieldMetadata
    {
        options = options || {};
        const metadata : SharedFieldMetadata = {
            skipCompare: _.isNullOrUndefined(options.skipCompare) ? false : options.skipCompare!,
            skipValueOutput: _.isNullOrUndefined(options.skipValueOutput) ? false : options.skipValueOutput!,
            persistence: options.persistence
        }
        return metadata;
    }

    private _getMetadata(name: string) : SharedFieldMetadata
    {
        const value = this._metadata[name];
        return this._makeMetadata(value);
    }
}

export interface SharedFieldPersistenceOptions {
    kind: 'url' | 'local-storage',
    key: string,
    base64?: boolean,
    json?: boolean,
    serialize?: (value: any) => string,
    deserialize?: (value: string) => any
}

export interface SharedFieldOptions {
    skipCompare? : boolean
    skipValueOutput? : boolean
    persistence?: SharedFieldPersistenceOptions
}

export interface SharedFieldMetadata {
    skipCompare : boolean
    skipValueOutput : boolean
    persistence?: SharedFieldPersistenceOptions
}

interface InternalSubscriber {
    id: string,
    handler: SubscribeHandler,
    isArray: boolean;
    keys: string[];
}

interface InternalGlobalSubscriber {
    id: string,
    handler: GlobalSubscribeHandler,
}

export interface Subscriber {
    id: string,
    close: () => void
}

export interface ISharedState {
    user() : ISharedState;
    close() : void;
    keys: string[];
    subscribe(keyOrKeys: string | string[], cb: SubscribeHandler) : Subscriber;
    tryGet<T = any>(name: string) : T | null;
    get<T = any>(name: string, defaultValue: T) : T;
    set<T = any>(name: string, value: T | null) : void;
    onChange(cb: GlobalSubscribeHandler) : Subscriber;

    markUserFlag(name: string, flag: string) : void;
    clearUserFlag(name: string, flag: string) : void;
    isUserPresent(name: string) : boolean;
    
}

export class SharedStateScope implements ISharedState
{
    private _sharedState : SharedState;
    private _subscribers : Subscriber[] = [];

    constructor(sharedState : SharedState)
    {
        this._sharedState = sharedState;
    }

    user() {
        return this._sharedState.user();
    }

    close() {
        for(let x of this._subscribers) {
            x.close();
        }
        this._subscribers = [];
    }

    subscribe(keyOrKeys: string | string[], cb: SubscribeHandler) : Subscriber
    {
        const subscriber = this._sharedState.subscribe(keyOrKeys, cb);
        this._subscribers.push(subscriber);
        return subscriber;
    }

    tryGet<T = any>(name: string) : T | null
    {
        return <T>this._sharedState.tryGet(name);
    }
    
    get<T = any>(name: string, defaultValue: T) : T
    {
        return <T>this._sharedState.get(name, defaultValue);
    }

    set<T = any>(name: string, value: T)
    {
        return this._sharedState.set(name, value);
    }

    onChange(cb: GlobalSubscribeHandler) : Subscriber {
        const subscriber = this._sharedState.onChange(cb);
        this._subscribers.push(subscriber);
        return subscriber;
    }

    get keys() : string[]
    {
        return this._sharedState.keys;
    }

    markUserFlag(name: string, flag: string) : void
    {
        return this._sharedState.markUserFlag(name, flag);
    }

    clearUserFlag(name: string, flag: string) : void
    {
        return this._sharedState.clearUserFlag(name, flag);
    }

    isUserPresent(name: string) : boolean
    {
        return this._sharedState.isUserPresent(name);
    }

}