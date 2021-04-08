import { OperationLogTracker } from "../src";
import { SharedState } from '../src';
import { app } from '../src/global';

describe('OperationLogTracker', () => {

    it('test-01', () => {
        const sharedState = new SharedState();
        const tracker = new OperationLogTracker(sharedState);
        tracker.report('something-test-01')
    });

    it('test-02', () => {
        app.operationLog.report('something-test-02')
    });

});
