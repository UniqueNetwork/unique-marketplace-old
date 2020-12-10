// Copyright 2020 @polkadot/app-nft authors & contributors

import { PunkForSaleInterface, Punk } from '../types';
import { url, path, attributes } from '../constants';

import { useCallback, useEffect, useState } from 'react';
import { useFetch, useAccounts, useApi } from '@polkadot/react-hooks';

interface MarketPlaceInterface {
  errorWhileFetchingPunks: boolean;
  punksForSale: Array<PunkForSaleInterface>;
  loadPunkFromChain: (contractAddress: string, collectionId: string, punkId: string) => Promise<Punk>;
}

interface PunkFromServerInterface {
  address: string;
  price: string;
}

const useMarketplace = (): MarketPlaceInterface => {
  const [punksForSale, setPunksForSale] = useState<Array<PunkForSaleInterface>>([]);
  const [errorWhileFetchingPunks, setErrorWhileFetchingPunks] = useState<boolean>(false);
  const { fetchData } = useFetch();
  const { allAccounts } = useAccounts();
  const { api } = useApi();

  const getTokensFromMarketplace = useCallback(() => {
    fetchData(`${url}${path}`).subscribe((result) => {
      if (!result || result.error) {
        setErrorWhileFetchingPunks(true)
      } else {
        const punks = Object.keys(result)
          .map((punkKey: string): PunkForSaleInterface  => ({
            id: punkKey.substring(punkKey.indexOf('-') + 1),
            isOwned: true,
            my: allAccounts.includes((result[punkKey] as PunkFromServerInterface).address),
            price: (result[punkKey] as PunkFromServerInterface).price
          }));
        setPunksForSale(punks);
      }
    });
  }, []);

  const loadPunkFromChain = useCallback(async (contractAddress, collectionId, punkId) => {
    console.log(`Loading punk ${punkId} from collection ${collectionId}`);

    const item = await api.query.nft.nftItemList(collectionId, punkId) as unknown as { Data: any, Owner: any };
    console.log("Received item: ", item);

    let attrArray = [];
    for (let i = 0; i < 7; i++) {
      if (item.Data[i+3] != 255)
        attrArray.push(attributes[item.Data[i+3]]);
    }

    return {
      originalId : item.Data[0] + item.Data[1] * 256,
      owner: item.Owner.toString(),
      sex: (item.Data[2] == 1) ? "Female" : "Male",
      attributes: attrArray,
      isOwned: contractAddress === item.Owner
    } as Punk;
  }, []);

  useEffect(() => {
    getTokensFromMarketplace();
  }, []);

  return { errorWhileFetchingPunks, punksForSale, loadPunkFromChain }
};

export default useMarketplace;
