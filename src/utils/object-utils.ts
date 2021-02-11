export function isEmptyObject(obj: any): boolean
{
    if (!obj) {
        return  true;
    }
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
            return false
    }
    return true
}
