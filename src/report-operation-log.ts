import { app } from "./global";
import { ISharedState } from "./shared-state";
import { v4 as uuidv4 } from 'uuid'

export type Message = {
    id: string,
    message: string,
    date: Date
}

export const TOP_MESSAGES_NUMBER = 5

export class ReportOperationLog {
    private _sharedState: ISharedState

    constructor() {
        this._sharedState = app.sharedState

        this._sharedState.set('operation_logs', [])
        this._sharedState.set('latest_operation_log', null)

        this.report = this.report.bind(this)
    }

    report(message: string): void {
        const operationLogs = this._sharedState.get('operation_logs')

        const newMessage = { id: uuidv4(), message, date: new Date() }

        this._sharedState.set('latest_operation_log', newMessage)

        this._sharedState.set('operation_logs', operationLogs.concat(newMessage))

        setTimeout(() => {
            this.removeMessage(newMessage)
        }, 10000) // 10sec
    }

    removeMessage(message: Message): void {
        const operationLogs: Message[] = this._sharedState.get('operation_logs')

        this._sharedState.set('operation_logs', operationLogs.filter(item => item.id !== message.id))
    }
}