// Copyright 2020 @polkadot/app-nft authors & contributors

import { PunkForSaleInterface, Punk } from '../types';
import { url, path, attributes } from '../constants';

import { useCallback, useEffect, useState } from 'react';
import { useMachine } from '@xstate/react';
import { useFetch, useAccounts, useApi } from '@polkadot/react-hooks';

import marketplaceStateMachine from './stateMachine';

interface MarketplaceStagesInterface {
  currentMarketplaceState: any;
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

type saleStage = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

const useMarketplaceStages = (): MarketplaceStagesInterface => {
  const [current, send] = useMachine(marketplaceStateMachine);

  console.log('current', current);

  return { currentMarketplaceState: current }
};

export default useMarketplaceStages;
