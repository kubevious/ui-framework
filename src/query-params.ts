import { useLocation } from "react-router-dom";

export function useSearchQuery(name: string) : string | null
{
    const query = new URLSearchParams(useLocation().search);
    return query.get(name);
}

export function useSearchQueryParams() : Record<string, string>
{
    const params: Record<string, string> = {};
    const query = new URLSearchParams(useLocation().search);
    query.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}