import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import { getAccountUniversal } from "@polkadot/react-components/util";
import envConfig from "@polkadot/apps-config/envConfig";
import { stringToHex } from "@polkadot/util";
import { useReloadPageSafeAccount } from './useReloadPageSafeAccount';

export type TCalculatedBid = {
    // sum of bids from this account
    bidderPendingAmount:string, 
    // min bid for this account in order to place a max bid
    minBidderAmount: string,
    // max bid for this auction
    contractPendingPrice: string,
    // step for this auction
    priceStep: string
}

export const useAuctionApi = () => {
    const { uniqueApi } = envConfig;
    const apiUrl = uniqueApi;

    const getCalculatedBid = async ({ collectionId, tokenId, account, setCalculatedBidFromServer }: { collectionId: string, tokenId: string, account: string, setCalculatedBidFromServer: ({bidderPendingAmount, minBidderAmount}:TCalculatedBid)=>void }) => {
        let responsefromBack;
        const url = `${apiUrl}/auction/calculate`;
        const data = {
            collectionId: Number(collectionId),
            tokenId: Number(tokenId),
            bidderAddress: account
        }
        console.log(data)
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                responsefromBack = await response.json();
                setCalculatedBidFromServer(responsefromBack);
            } catch (error) {
                console.error('Ошибка:', error);
            }
    }

    const withdrawBids = async (account: string, collectionId: string, tokenId: string, setWaitingResponse: (waiting: boolean) => void) => {
        const accounts = await web3Accounts();
        const signer = accounts.find((a) => a.address === getAccountUniversal(account));
        if (!signer) {
            return;
        }

        const injector = await web3FromSource(signer.meta.source);
        const signRaw = injector?.signer?.signRaw;

        if (!!signRaw) {
            const timeStamp = Date.now();
            const { signature } = await signRaw({
                address: account,
                data: stringToHex(`collectionId=${collectionId}&tokenId=${tokenId}&timestamp=${timeStamp}`),
                type: 'bytes'
            });
            const url = `${apiUrl}/auction/withdraw_bid?collectionId=${collectionId}&tokenId=${tokenId}&timestamp=${timeStamp}`;

            try {
                setWaitingResponse(true);
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `${account}:${signature}`,
                    }
                });
                const json = await response.json();
                setWaitingResponse(false);
            } catch (error) {
                console.error('Ошибка:', error);
                setWaitingResponse(false);
            }
        }
    };

    const cancelAuction = async (account: string, collectionId: string, tokenId: string, setWaitingResponse: (waiting: boolean) => void) => {
        const accounts = await web3Accounts();
        const signer = accounts.find((a) => a.address === getAccountUniversal(account));
        if (!signer) {
            return;
        }

        const injector = await web3FromSource(signer.meta.source);
        const signRaw = injector?.signer?.signRaw;

        if (!!signRaw) {
            const timeStamp = Date.now();
            const { signature } = await signRaw({
                address: account,
                data: stringToHex(`collectionId=${collectionId}&tokenId=${tokenId}&timestamp=${timeStamp}`),
                type: 'bytes'
            });
            const url = `${apiUrl}/auction/cancel_auction?collectionId=${collectionId}&tokenId=${tokenId}&timestamp=${timeStamp}`;

            try {
                setWaitingResponse(true);
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `${account}:${signature}`,
                    }
                });
                const json = await response.json();
                setWaitingResponse(false);
                useReloadPageSafeAccount();
            } catch (error) {
                console.error('Ошибка:', error);
                setWaitingResponse(false);
                useReloadPageSafeAccount();
            }
        }
    };

    return { cancelAuction, getCalculatedBid, withdrawBids }
}