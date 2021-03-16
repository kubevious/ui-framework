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

    constructor()
    {
        console.log("[SharedState] CONSTRUCTOR");
    }

    get keys()
    {
        return _.keys(this._values);
    }

    register(name: string, options?: SharedFieldOptions)
    {
        let metadata = this._makeMetadata(options)
        this._metadata[name] = metadata;
    }

    private _makeMetadata(options?: SharedFieldOptions) : SharedFieldMetadata
    {
        options = options || {};
        let metadata : SharedFieldMetadata = {
            skipCompare: _.isNullOrUndefined(options.skipCompare) ? false : options.skipCompare!,
            skipValueOutput: _.isNullOrUndefined(options.skipValueOutput) ? false : options.skipValueOutput!,
        }
        return metadata;
    }

    private _getMetadata(name: string) : SharedFieldMetadata
    {
        let value = this._metadata[name];
        return this._makeMetadata(value);
    }

    close()
    {
        throw new Error("Close functionality works for user scoped shared state objects.");
    }

    user() : ISharedState
    {
        let subscribers : Subscriber[] = [];

        return {
            user: () => {
                return this.user();
            },
            close: () => {
                for(let x of subscribers) {
                    x.close();
                }
                subscribers = [];
            },
            subscribe: (keyOrKeys, cb) => {
                let subscriber = this.subscribe(keyOrKeys, cb);
                subscribers.push(subscriber);
                return subscriber;
            },
            get: (name: string) => {
                return this.get(name);
            },
            set: (name: string, value: any) => {
                return this.set(name, value);
            }
        }
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
        let subscriber : InternalSubscriber = {
            id: uuidv4(),
            handler: cb,
            isArray: _.isArray(keyOrKeys),
            keys: _.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
        }

        this._subscribers[subscriber.id] = subscriber;

        for(let key of subscriber.keys) {
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

    onChange(cb: GlobalSubscribeHandler)
    {
        let subscriber : InternalGlobalSubscriber = {
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

    get(name: string)
    {
        let value = this._values[name];
        if (_.isNullOrUndefined(value)) {
            value = null;
        }
        return value;
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

        this._trigger();
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
        let diff : Record<string, boolean> = {};

        {
            for(let name of _.keys(this._values))
            {
                let value = this._values[name];
                let lastValue = this._lastValues[name];

                if (!_.fastDeepEqual(value, lastValue))
                {
                    diff[name] = true;
                }
            }
        }

        {
            for(let name of _.keys(this._lastValues))
            {
                let value = this._values[name];
                if (_.isNullOrUndefined(value)) {
                    diff[name] = true;
                }
            }
        }
        
        let subscriberIDs : Record<string, boolean> = {};
        for(let name of _.keys(diff))
        {
            if (this._subscribedKeys[name])
            {
                for(let id of _.keys(this._subscribedKeys[name]))
                {
                    subscriberIDs[id] = true;
                }
            }
        }

        this._lastValues = _.cloneDeep(this._values);

        for(let id of _.keys(subscriberIDs))
        {
            this._notifyToSubscriber(id);
        }

        if (_.keys(this._globalSubscribers).length > 0) 
        {
            for(let globalSubscriber of _.values(this._globalSubscribers))
            {
                globalSubscriber.handler();
            }
        }
    }

    private _notifyToSubscriber(id: string)
    {
        let subscriber = this._subscribers[id];
        let argsArray : any[] = [];

        if (!subscriber)
        {
            return;
        }

        if (subscriber.isArray)
        {
            let dict : Record<string, any> = {};
            for(let name of subscriber.keys)
            {
                let value = this.get(name);
                dict[name] = value;
            }
            argsArray.push(dict);
        }
        else
        {
            let value = this.get(subscriber.keys[0]);
            argsArray.push(value);
        }

        // console.log("[SharedState] Trigger " + id + " :: " + JSON.stringify(argsArray));
        subscriber.handler.apply(null, <any>argsArray);
    }
}

export interface SharedFieldOptions {
    skipCompare? : boolean
    skipValueOutput? : boolean
}

export interface SharedFieldMetadata {
    skipCompare : boolean
    skipValueOutput : boolean
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
};

export interface ISharedState {
    user: () => ISharedState;
    close: () => void;
    subscribe: (keyOrKeys: string | string[], cb: SubscribeHandler) => Subscriber;
    get: (name: string) => any;
    set: (name: string, value: any) => void;
}