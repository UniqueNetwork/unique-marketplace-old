// Copyright 2020 @polkadot/app-nft authors & contributors

import { PunkForSaleInterface, Punk } from '../types';
import { url, path, attributes } from '../constants';

import { useCallback, useEffect, useState } from 'react';
import { useFetch, useAccounts, useApi } from '@polkadot/react-hooks';

interface SaleOrByStagesInterface {

}

interface PunkFromServerInterface {
  address: string;
  price: string;
}

// 0 == user owns token, no offers placed
// 1 == user pressed Trade button
// 2 == token sent to vault, waiting for deposit (ownership cannot be determined)
// 3 == deposit ready, user can place ask
// 4 == Ask placed, user can cancel
// 5 == Someone else owns token, no offers placed
// 6 == Token is for sale, can buy
// 7 == User pressed buy button, should deposit KSM
// 8 == User deposited KSM, waiting to register
// 9 == KSM deposited, Can sign buy transaction

// type saleStage = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

const useSaleOrBuyStages = (): SaleOrByStagesInterface => {
  // const [saleStage, setSaleStage] = useState<saleStage>('0');
  const [errorWhileFetchingPunks, setErrorWhileFetchingPunks] = useState<boolean>(false);
  const [punksForSale, setPunksForSale] = useState<Array<any>>([]);
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

    const item = await api.query.nft.nftItemList(collectionId, punkId) as unknown as { Data: any, Owner: any };

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

export default useSaleOrBuyStages;
