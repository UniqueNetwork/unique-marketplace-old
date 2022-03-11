
export const useReloadPageSafeAccount = (history: { location: { pathname: any; search: any; }; replace: (arg0: string | Location) => void; }) => {
    const path = `${history.location.pathname}${history.location.search}`;
    history.replace(window.location);
    history.replace(path);
}