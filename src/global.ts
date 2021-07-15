import { Application } from './app' ;

function getApplication() : Application
{
    if (typeof window !== 'undefined') {
        if ((<any>window).kubeviousApp) {
            return (<any>window).kubeviousApp;
        } else {
            const app = new Application();
            (<any>window).kubeviousApp = app;
            return app;
        }
    }
    
    if (typeof global !== 'undefined') {
        if ((<any>global).kubeviousApp) {
            return (<any>global).kubeviousApp;
        } else {
            const app = new Application();
            (<any>global).kubeviousApp = app;
            return app;
        }
    }

    throw new Error("global or window not found.");
}

export const app : Application = getApplication();

export const sharedState = app.sharedState;
export const operationLog = app.operationLog;