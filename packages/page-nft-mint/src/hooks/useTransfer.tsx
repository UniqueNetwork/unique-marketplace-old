// Copyright 2020 UseTech authors & contributors

import { MessageInterface } from '../components/types';

interface PolkadotApiInterface {
  query: any;
  tx: {
    nft: {
      transfer: (collectionId: string, tokenId: string, recipient: string) => any;
    }
  };
}

function useTransfer(account: string | null, api: PolkadotApiInterface) {

  const transferToken = async(collectionId: string, tokenId: string, recipient: string, pushMessage: (message: MessageInterface) => void) => {
    if (!account || !tokenId || !recipient) {
      console.log('params not specified');
      return;
    }
    const transfer = await api.tx.nft
      .transfer(collectionId, tokenId, recipient)
      .signAndSend(account, (result: any) => {
        console.log(`Current tx status is ${result.status}`);
        pushMessage({
          info: true,
          messageText: `Current tx status is ${result.status}`
        });
        if (result.status.isInBlock) {
          console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
          pushMessage({
            success: true,
            messageText: `Transaction included at blockHash ${result.status.asInBlock}`
          });
        } else if (result.status.isFinalized) {
          console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
          pushMessage({
            success: true,
            messageText: `Transaction finalized at blockHash ${result.status.asFinalized}`
          });
          transfer();
        }
      });
  };

  return { transferToken };
}

export default useTransfer;
