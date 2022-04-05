import { ISharedState } from "./shared-state";
import { v4 as uuidv4 } from 'uuid'

export type Message = {
    id: string,
    message: string,
    date: Date
}

export const TOP_MESSAGES_NUMBER = 5 // max messages
export const MESSAGES_TIMEOUT_MS = 5000 // max messages

export class OperationLogTracker
{
    private _sharedState: ISharedState

    constructor(sharedState: ISharedState) {
        this._sharedState = sharedState;

        this._sharedState.set('operation_logs', [])
        this._sharedState.set('latest_operation_log', null)

        this.report = this.report.bind(this)
    }

    report(message: string): void {
        let operationLogs = this._sharedState.get<Message[]>('operation_logs', [])!;

        const newMessage : Message = { id: uuidv4(), message, date: new Date() }

        operationLogs = [newMessage, ...operationLogs]

        const newOperationLogs =
            operationLogs.length > TOP_MESSAGES_NUMBER
                ? operationLogs.slice(0, TOP_MESSAGES_NUMBER)
                : operationLogs

        this._sharedState.set('operation_logs', newOperationLogs);

        setTimeout(() => {
            this._removeMessage(newMessage)
        }, MESSAGES_TIMEOUT_MS);
    }

    private _removeMessage(message: Message) {
        const operationLogs = this._sharedState.get<Message[]>('operation_logs', [])!;

        const newOperationLogs = operationLogs.filter(item => item.id !== message.id);

        this._sharedState.set('operation_logs', newOperationLogs)
    }
}