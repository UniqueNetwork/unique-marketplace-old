// Copyright 2020 UseTech authors & contributors
import React, { useCallback, useEffect, useState, SyntheticEvent } from 'react';
import { web3Accounts } from '@polkadot/extension-dapp';
import Dropdown, {DropdownProps} from 'semantic-ui-react/dist/commonjs/modules/Dropdown';

import useAccounts from '../../hooks/useAccounts';
import './accountsDropdown.scss';

interface Props {
  account: string | null | undefined;
  api: any;
  setAccount: (accountId: string) => void;
}

interface web3AccountsInterface {
  address: string;
  meta: {
    genesisHash?: string | null | undefined;
    name?: string | undefined;
    source: string;
  }
}

interface optionsInterface {
  key: string;
  text: string;
  value: string;
}

function AccountsDropdown({ api, account, setAccount }: Props): React.ReactElement<Props> {
  const { allAccounts } = useAccounts();
  const [options, setOptions] = useState<Array<optionsInterface>>([]);
  const [extensionAccounts, setExtensionAccounts] = useState<Array<web3AccountsInterface>>([]);
  // const [signerInst, setSignerInst] = useState<any>(null);

  /* const setSigner = useCallback(async (): Promise<void> => {
    if (!account || !api) {
      return;
    }

    keyring.loadAll({
      genesisHash: api.genesisHash,
      isDevelopment: true,
      ss58Format: 0,
      type: 'ed25519'
    });

    const pair = keyring.getAddress(account, null);
    let accountSource = 'polkadot-js';

    if (pair) {
      const { meta: { source } } = pair;

      accountSource = source as string;
    }

    const injected = await web3FromSource(accountSource);
    api.setSigner(injected.signer);
    setSignerInst(injected.signer);
  }, [account, api]); */

  const fillExtensionAccounts = useCallback( async() => {
    const accounts = await web3Accounts();
    if (accounts && accounts.length) {
      setExtensionAccounts(accounts);
    }
  }, []);

  const onChange = useCallback((event: SyntheticEvent, data: DropdownProps) => {
    if (!data.value) {
      return;
    }
    setAccount(data.value.toString());
  }, []);

  const mergeOptions = useCallback(() => {
    const extAddresses = extensionAccounts.map(item => ({ key: item.address, value: item.address, text: item.address }) as optionsInterface);
    setOptions(extAddresses.concat([]));
  }, [allAccounts, extensionAccounts]);

  /* useEffect(() => {
    if (api && account && !signerInst) {
      void setSigner();
    }
  }, [account, api, setSigner, signerInst]); */

  useEffect(() => {
    mergeOptions();
  }, [mergeOptions]);

  useEffect(() => {
    void fillExtensionAccounts();
  }, [fillExtensionAccounts]);

  return (
    <Dropdown
      placeholder='Select address'
      fluid
      search
      selection
      onChange={onChange}
      options={options}
    />
  )
}

export default React.memo(AccountsDropdown);
