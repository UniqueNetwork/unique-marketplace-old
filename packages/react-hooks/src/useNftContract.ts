// Copyright 2017-2022 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Contract } from 'web3-eth-contract';
import type { MarketplaceAbiMethods } from '@polkadot/apps/ContractContext';

import BN from 'bn.js';
import { useCallback, useContext, useMemo, useState } from 'react';
import Web3 from 'web3';

import ContractContext from '@polkadot/apps/ContractContext/ContractContext';
import envConfig from '@polkadot/apps-config/envConfig';
import { StatusContext } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { formatBalance } from '@polkadot/util';
import { evmToAddress } from '@polkadot/util-crypto';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import nonFungibleAbi from './abi/nonFungibleAbi.json';
import { CrossAccountId, normalizeAccountId, subToEth } from './utils';

type EvmCollectionAbiMethods = {
  approve: (contractAddress: string, tokenId: string) => {
    encodeABI: () => any;
  },
  getApproved: (tokenId: string | number) => {
    call: () => Promise<string>;
  }
}
export type TokenFullAskType = {
  currencyCode: string; // "0x0000000000000000000000000000000000000001"
  flagActive: '0' | '1';
  idCollection: string; //  "0x17C4e6453cC49AAaaEaCA894E6D9683e00000001"
  idNFT: string; //  "1"
  name: string; // "UniqueBabies"
  ownerAddr: string; // "0x2E065a5eaccA1c533a931545f2bFb3C18F7c439b"
  price: string; // "10000000000000000"
  symbol: string; // "UBaby"
  time: string; // "1639056948"
  tokenURI: string; // "\nH{\"ipfs\":\"Qmeyy5uhgfE5e3tgYBaqQQNcrRY4TEiN6SvzJovHtHLhr8\",\"type\":\"image\"}\u0010\u0001\u0018\u0001\"\u0002\u0000\u0002"
}
export type TokenAskType = { flagActive: '0' | '1', ownerAddr: string, price: BN };

export interface AskOutputInterface {
  output: [string, string, string, BN, string]
}

export interface useNftContractInterface {
  // abi: Abi | undefined;
  addAsk: (collectionId: string, tokenId: string, amount: BN, failCallBack: () => void, successCallBack: () => void) => void;
  approveTokenToContract: (tokenId: string, failCallBack: () => void, successCallBack: () => void, onlyGetFees?: boolean) => Promise<BN | null>;
  balanceTransfer: (recipient: string, amount: BN, failCallBack: () => void, successCallBack: () => void) => void;
  buyToken: (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => void;
  cancelAsk: (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => void;
  checkWhiteList: (ethAddress: string) => Promise<boolean>;
  contractInstance: Contract | null;
  decimals: number;
  deposited: BN | undefined;
  depositor: string | undefined;
  evmCollectionInstance: Contract | null;
  getApproved: (collectionId: string, tokenId: string, tokenOwner: CrossAccountId) => Promise<boolean>;
  getMySubEthAddressBalance: (address: string) => Promise<BN>;
  getTokenAsk: (collectionId: string, tokenId: string) => Promise<TokenAskType | null>;
  getTokenOrder: (order: number) => void;
  getTokenOrders: () => void;
  getUserDeposit: () => Promise<BN | null>;
  initCollectionAbi: (collectionId: string) => void;
  isContractReady: boolean;
  tokenAsk: TokenAskType | undefined;
  transferToken: (collectionId: string, tokenId: string, address: { Ethereum?: string, Substrate?: string }, startCallBack: () => void, successCallBack: () => void, errorCallBack: () => void, ethAccount?: string, onlyGetFees?: boolean) => void;
  withdrawAllKSM: (failCallBack: () => void, successCallBack: () => void) => void;
}

export const GAS_ARGS = { gas: 2500000 };

export function collectionIdToAddress (address: number): string {
  if (address >= 0xffffffff || address < 0) {
    throw new Error('id overflow');
  }

  const buf = Buffer.from([0x17, 0xc4, 0xe6, 0x45, 0x3c, 0xc4, 0x9a, 0xaa, 0xae, 0xac, 0xa8, 0x94, 0xe6, 0xd9, 0x68, 0x3e,
    address >> 24,
    (address >> 16) & 0xff,
    (address >> 8) & 0xff,
    address & 0xff
  ]);

  return Web3.utils.toChecksumAddress('0x' + buf.toString('hex'));
}

/*
to sell:
1. Transfer NFT to your eth address mirror - subToEth(account);
2. Transfer money to your eth address mirror to pay fees (for approval);
3. Approve contract to get your NFT;
4. AddAsk with token price;
5.
 */

// https://docs.google.com/document/d/1WED9VP8Yj52Un4qmkGDpzjesQTzwwoDgYMk1Ty8yftQ/edit
export function useNftContract (account: string | undefined, ethAccount: string | undefined): useNftContractInterface {
  const { api } = useApi();
  const [depositor, setDepositor] = useState<string>();
  const { queueExtrinsic } = useContext(StatusContext);
  const { deposited, evmCollectionInstance, getUserDeposit, matcherContractInstance, setEvmCollectionInstance, web3Instance } = useContext(ContractContext);
  const [tokenAsk, setTokenAsk] = useState<TokenAskType>();
  const decimals = formatBalance.getDefaults().decimals;

  const { contractAddress, contractOwner } = envConfig;

  const checkWhiteList = useCallback(async (ethAccount: string): Promise<boolean> => {
    try {
      return (await api.query.evmContractHelpers.allowlist(contractAddress, ethAccount)).toJSON() as boolean;
    } catch (e) {
      console.log('checkWhiteList Error: ', e);
    }

    return false;
  }, [api.query.evmContractHelpers, contractAddress]);

  const getApproved = useCallback(async (collectionId: string, tokenId: string, tokenOwner: CrossAccountId): Promise<boolean> => {
    try {
      if (account && matcherContractInstance && evmCollectionInstance) {
        const approvedCount = (await api.rpc.unique.allowance(collectionId, normalizeAccountId(tokenOwner), normalizeAccountId({ Ethereum: contractAddress }), tokenId)).toJSON() as number;

        return approvedCount === 1;
      }
    } catch (e) {
      console.log('getUserDeposit Error: ', e);
    }

    return false;
  }, [account, matcherContractInstance, evmCollectionInstance, api.rpc.unique, contractAddress]);

  const getMySubEthAddressBalance = useCallback(async (mySubEthAddress: string): Promise<BN> => {
    if (mySubEthAddress && api) {
      const balancesAll = await api.derive.balances?.all(mySubEthAddress);

      if (balancesAll) {
        return balancesAll.availableBalance;
      }
    }

    return new BN(0);
  }, [api]);

  const setCollectionSponsor = useCallback((collectionId: string, sponsorAddress: string) => {
    if (account && api) {
      try {
        const extrinsic1 = api.tx.unique.setCollectionLimits(collectionId, { sponsorApproveTimeout: 0 });
        const extrinsic2 = api.tx.unique.setCollectionSponsor(collectionId, sponsorAddress);
        const extrinsic3 = api.tx.unique.confirmSponsorship(collectionId);

        queueExtrinsic({
          accountId: account,
          extrinsic: extrinsic1,
          isUnsigned: false,
          txFailedCb: () => { console.log('setCollectionLimits start'); },
          txStartCb: () => { console.log('setCollectionLimits start'); },
          txSuccessCb: () => queueExtrinsic({
            accountId: account,
            extrinsic: extrinsic2,
            isUnsigned: false,
            txFailedCb: () => { console.log('setCollectionSponsor fail'); },
            txStartCb: () => { console.log('setCollectionSponsor start'); },
            txSuccessCb: () => queueExtrinsic({
              accountId: account,
              extrinsic: extrinsic3,
              isUnsigned: false,
              txFailedCb: () => { console.log('confirmSponsorship fail'); },
              txStartCb: () => { console.log('confirmSponsorship start'); },
              txSuccessCb: () => { console.log('confirmSponsorship success'); },
              txUpdateCb: () => { console.log('confirmSponsorship update'); }
            }),
            txUpdateCb: () => { console.log('setCollectionSponsor update'); }
          }),
          txUpdateCb: () => { console.log('setCollectionLimits update'); }
        });
      } catch (e) {
        console.log('setCollectionSponsor error', e);
      }
    }
  }, [account, api, queueExtrinsic]);

  // this method should be called from matcher owner
  const approveTokenToContract = useCallback(async (tokenId: string, failCallBack: () => void, successCallBack: () => void, onlyGetFees?: boolean): Promise<BN | null> => {
    if (account && web3Instance && evmCollectionInstance) {
      try {
        // value = 0 | 1
        if (matcherContractInstance && web3Instance && contractAddress) {
          const extrinsic = api.tx.evm.call(
            subToEth(account),
            evmCollectionInstance.options.address,
            (evmCollectionInstance.methods as EvmCollectionAbiMethods).approve(contractAddress, tokenId).encodeABI(),
            0,
            GAS_ARGS.gas,
            await web3Instance.eth.getGasPrice(),
            null
          );

          if (onlyGetFees) {
            const { partialFee } = await extrinsic.paymentInfo(account) as { partialFee: BN };

            return partialFee;
          } else {
            queueExtrinsic({
              accountId: account && account.toString(),
              extrinsic,
              isUnsigned: false,
              txFailedCb: () => failCallBack(),
              txStartCb: () => { console.log('approveTokenToContract start'); },
              txSuccessCb: () => successCallBack(),
              txUpdateCb: () => { console.log('approveTokenToContract update'); }
            });
          }
        }
      } catch (e) {
        console.log('approveTokenToContract Error', e);
      }
    }

    return null;
  }, [account, web3Instance, evmCollectionInstance, matcherContractInstance, contractAddress, api.tx.evm, queueExtrinsic]);

  const balanceTransfer = useCallback((recipient: string, amount: BN, failCallBack: () => void, successCallBack: () => void) => {
    const extrinsic = api.tx.balances.transfer(recipient, amount);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic,
      isUnsigned: false,
      txFailedCb: () => failCallBack(),
      txStartCb: () => { console.log('balanceTransfer start'); },
      txSuccessCb: () => successCallBack(),
      txUpdateCb: () => { console.log('balanceTransfer update'); }
    });
  }, [account, api, queueExtrinsic]);

  /*
  const KSM = 10n ** 15n;
  10n * KSM
  check orders: orders(orderNumber);
   */
  const addAsk = useCallback(async (collectionId: string, tokenId: string, price: BN, failCallBack: () => void, successCallBack: () => void) => {
    //  await executeEthTxOnSub(web3, api, seller, matcher, m => m.addAsk(PRICE, '0x0000000000000000000000000000000000000001', evmCollection.options.address, tokenId));
    if (account && web3Instance && evmCollectionInstance) {
      try {
        if (matcherContractInstance && web3Instance) {
          const extrinsic = api.tx.evm.call(
            subToEth(account),
            contractAddress,
            (matcherContractInstance.methods as MarketplaceAbiMethods).addAsk(price.toString(), '0x0000000000000000000000000000000000000001', evmCollectionInstance.options.address, tokenId).encodeABI(),
            0,
            GAS_ARGS.gas,
            await web3Instance.eth.getGasPrice(),
            null
          );

          queueExtrinsic({
            accountId: account && account.toString(),
            extrinsic,
            isUnsigned: false,
            txFailedCb: () => failCallBack(),
            txStartCb: () => { console.log('addAsk start'); },
            txSuccessCb: () => successCallBack(),
            txUpdateCb: () => { console.log('addAsk update'); }
          });
        }
      } catch (e) {
        console.log('addAsk Error', e);
      }
    }
  }, [account, web3Instance, evmCollectionInstance, matcherContractInstance, api.tx.evm, contractAddress, queueExtrinsic]);

  const buyToken = useCallback(async (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => {
    if (account && ethAccount && web3Instance && evmCollectionInstance && matcherContractInstance) {
      try {
        console.log('ehtAcc', ethAccount, 'evmCollectionInstance.options.address', evmCollectionInstance.options.address, 'tokenId', tokenId);

        const extrinsic = api.tx.evm.call(
          ethAccount,
          contractAddress,
          (matcherContractInstance.methods as MarketplaceAbiMethods).buyKSM(evmCollectionInstance.options.address, tokenId, ethAccount, ethAccount).encodeABI(),
          0,
          GAS_ARGS.gas,
          await web3Instance.eth.getGasPrice(),
          null
        );

        console.log('extrinsic', extrinsic);

        queueExtrinsic({
          accountId: account && account.toString(),
          extrinsic,
          isUnsigned: false,
          txFailedCb: () => failCallBack(),
          txStartCb: () => { console.log('buyToken start'); },
          txSuccessCb: () => successCallBack(),
          txUpdateCb: () => { console.log('buyToken update'); }
        });
      } catch (e) {
        console.log('buyToken Error', e);
      }
    }
  }, [account, ethAccount, web3Instance, evmCollectionInstance, matcherContractInstance, api.tx.evm, contractAddress, queueExtrinsic]);

  const transferToken = useCallback(async (collectionId: string, tokenId: string, address: { Ethereum?: string, Substrate?: string }, startCallBack: () => void, successCallBack: () => void, errorCallBack: () => void, ethAccount?: string, onlyGetFees?: boolean) => {
    if (account) {
      try {
        // To transfer item to matcher it first needs to be transferred to Eth account-mirror
        let extrinsic = api.tx.unique.transfer(address, collectionId, tokenId, 1);

        if (address.Substrate && ethAccount) {
          extrinsic = api.tx.unique.transferFrom(normalizeAccountId({ Ethereum: ethAccount } as CrossAccountId), normalizeAccountId(address as CrossAccountId), collectionId, tokenId, 1);
        }

        if (onlyGetFees) {
          const { partialFee } = await extrinsic.paymentInfo(account) as { partialFee: BN };

          return partialFee;
        } else {
          queueExtrinsic({
            accountId: account,
            extrinsic,
            isUnsigned: false,
            txFailedCb: () => errorCallBack(),
            txStartCb: () => startCallBack(),
            txSuccessCb: () => successCallBack(),
            txUpdateCb: () => { console.log('transferToken update'); }
          });
        }
      } catch (e) {
        console.log('transferToken error', e);
      }
    }

    return null;
  }, [account, api, queueExtrinsic]);

  const cancelAsk = useCallback(async (collectionId: string, tokenId: string, failCallBack: () => void, successCallBack: () => void) => {
    try {
      if (account && matcherContractInstance && evmCollectionInstance && web3Instance) {
        const extrinsic = api.tx.evm.call(
          subToEth(account),
          contractAddress,
          (matcherContractInstance.methods as MarketplaceAbiMethods).cancelAsk(evmCollectionInstance.options.address, tokenId).encodeABI(),
          0,
          GAS_ARGS.gas,
          await web3Instance.eth.getGasPrice(),
          null
        );

        queueExtrinsic({
          accountId: account && account.toString(),
          extrinsic,
          isUnsigned: false,
          txFailedCb: () => failCallBack(),
          txStartCb: () => { console.log('cancelAsk start'); },
          txSuccessCb: () => successCallBack(),
          txUpdateCb: () => { console.log('cancelAsk update'); }
        });
      }
    } catch (e) {
      console.log('cancelAsk error', e);
    }
  }, [account, matcherContractInstance, evmCollectionInstance, web3Instance, api.tx.evm, contractAddress, queueExtrinsic]);

  const withdrawAllKSM = useCallback(async (failCallBack: () => void, successCallBack: () => void) => {
    try {
      if (account && ethAccount && matcherContractInstance && web3Instance) {
        const extrinsic = api.tx.evm.call(
          ethAccount,
          contractAddress,
          (matcherContractInstance.methods as MarketplaceAbiMethods).withdrawAllKSM(ethAccount).encodeABI(),
          0,
          GAS_ARGS.gas,
          await web3Instance.eth.getGasPrice(),
          null
        );

        queueExtrinsic({
          accountId: account && account.toString(),
          extrinsic,
          isUnsigned: false,
          txFailedCb: () => failCallBack(),
          txStartCb: () => { console.log('withdrawKSM start'); },
          txSuccessCb: () => successCallBack(),
          txUpdateCb: () => { console.log('withdrawKSM update'); }
        });
      }

      return null;
    } catch (e) {
      console.log('withdrawKSM Error: ', e);

      return null;
    }
  }, [account, ethAccount, matcherContractInstance, web3Instance, api.tx.evm, contractAddress, queueExtrinsic]);

  const getTokenOrder = useCallback(async (orderNumber: number) => {
    if (matcherContractInstance) {
      // Error: Returned error: VM Exception while processing transaction: revert
      try {
        const order = await (matcherContractInstance.methods as MarketplaceAbiMethods).orders(orderNumber).call();

        console.log('getTokenOrder order', order);
      } catch (e) {
        console.log('getTokenOrder error', e);
      }
    }
  }, [matcherContractInstance]);

  const getTokenOrders = useCallback(async () => {
    if (matcherContractInstance) {
      try {
        const ordersLength: number = await (matcherContractInstance.methods as MarketplaceAbiMethods).getOrdersLen().call();

        console.log('getTokenOrders ordersLength', ordersLength);
      } catch (e) {
        console.log('getTokenOrders error', e);
      }
    }
  }, [matcherContractInstance]);

  const getTokenAsk = useCallback(async (collectionId: string, tokenId: string): Promise<TokenAskType | null> => {
    try {
      if (matcherContractInstance) {
        const { flagActive, ownerAddr, price }: TokenAskType = await (matcherContractInstance.methods as MarketplaceAbiMethods).getOrder(collectionIdToAddress(parseInt(collectionId, 10)), tokenId).call();

        const ask: TokenAskType = {
          flagActive,
          ownerAddr: ownerAddr,
          price: new BN(price)
        };

        // '10000000000000000000' - 10 * 10n18
        // '0x0000000000000000000000000000000000000000'
        console.log('getTokenAsk ask', ask, 'collectionId', collectionId, 'tokenId', tokenId);

        setTokenAsk(ask);
        setDepositor(evmToAddress(ownerAddr, 42, 'blake2'));

        return ask;
      }
    } catch (e) {
      console.log('getTokenAsk error', e);

      setTokenAsk(undefined);
    }

    return null;
  }, [matcherContractInstance]);

  const initCollectionAbi = useCallback((collectionId) => {
    if (web3Instance) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const evmCollection: Contract = new web3Instance.eth.Contract(nonFungibleAbi as any, collectionIdToAddress(parseInt(collectionId, 10)), { from: contractOwner });

      setEvmCollectionInstance(evmCollection);
    }
  }, [contractOwner, setEvmCollectionInstance, web3Instance]);

  const isContractReady = useMemo(() => {
    return !!(matcherContractInstance);
  }, [matcherContractInstance]);

  /* const registerDeposit = useCallback(async () => {
    if (ethAccount && contractInstance && tokenAsk && web3Instance) {
      console.log('tokenAsk.price.toNumber()', tokenAsk.price.toNumber());
      // const gasPrice = await web3Instance.eth.getGasPrice();

      await contractInstance.methods.depositKSM('10000000000000000000', ethAccount).send({ from: matcherOwnerAddress });
    }
  }, [ethAccount, contractInstance, tokenAsk, web3Instance]);

  useEffect(() => {
    void registerDeposit();
  }, [registerDeposit]); */

  /* useEffect(() => {
    setCollectionSponsor('13', '5ELgyTdWdPoDuGb8CizikC5GW5pCHgCWiMfXJn1FfYKYrJEA');
  }, [setCollectionSponsor]); */

  return {
    addAsk,
    approveTokenToContract,
    balanceTransfer,
    buyToken,
    cancelAsk,
    checkWhiteList,
    contractInstance: matcherContractInstance,
    decimals,
    deposited,
    depositor,
    evmCollectionInstance,
    getApproved,
    getMySubEthAddressBalance,
    getTokenAsk,
    getTokenOrder,
    getTokenOrders,
    getUserDeposit,
    initCollectionAbi,
    isContractReady,
    tokenAsk,
    transferToken,
    withdrawAllKSM
  };
}
