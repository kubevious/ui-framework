import { ReportOperationLog } from "../src";

describe('reportOperationLog', () => {

    it('test-01', () => {
        const reportOperationLog = new ReportOperationLog()
        reportOperationLog.report('something')
    });

});
