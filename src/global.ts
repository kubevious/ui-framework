import { Application } from './app' ;

export const app : Application = new Application();

export const sharedState = app.sharedState;
export const operationLog = app.operationLog;