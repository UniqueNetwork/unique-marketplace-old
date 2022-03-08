import { useHistory } from 'react-router-dom';

export const useReloadPageSafeAccount = () => {
    const history = useHistory();
    const path = `${history.location.pathname}${history.location.search}`;
    history.replace(window.location);
    history.replace(path);
}