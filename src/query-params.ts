import { useLocation } from "react-router-dom";

export function useSearchQuery(name: string) : string | null
{
    const query = new URLSearchParams(useLocation().search);
    return query.get(name);
}