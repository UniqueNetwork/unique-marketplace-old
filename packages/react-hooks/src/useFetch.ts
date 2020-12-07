// Copyright 2020 @polkadot/app-nft authors & contributors

import { useCallback } from 'react';
import { of } from 'rxjs/observable/of';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, catchError } from 'rxjs/operators';

export const useFetch = () => {
  const fetchData = useCallback((url: string) => {
    return fromFetch(url).pipe(
      switchMap((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return of({ error: true, message: `Error ${response.status}` });
        }
      }),
      catchError((err) => {
        return of({ error: true, message: err.message });
      })
    );
  }, []);

  return { fetchData }
};

export default useFetch;
