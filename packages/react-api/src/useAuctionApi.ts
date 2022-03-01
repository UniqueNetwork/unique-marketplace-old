import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import { getAccountUniversal } from "@polkadot/react-components/util";
import envConfig from "@polkadot/apps-config/envConfig";
import { stringToHex } from "@polkadot/util";

export const useAuctionApi = () => {
    const { uniqueApi } = envConfig;
    const apiUrl = uniqueApi;

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
                        'x-polkadot-signature': signature,
                        'x-polkadot-signer': account
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
                        'x-polkadot-signature': signature,
                        'x-polkadot-signer': account
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

    return { cancelAuction, withdrawBids }
}