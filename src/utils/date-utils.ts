import moment from 'moment'

export function dateToString(date: any): string
{
    if (!date) {
        return '';
    }

    return moment(date).format(
        'MMM DD hh:mm:ss A'
    );
}
