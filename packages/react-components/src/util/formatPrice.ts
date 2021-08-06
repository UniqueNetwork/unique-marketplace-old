// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

export default function formatPrice (price: string): string {
  while (price.includes('.') && (price[price.length - 1] === '0' || price[price.length - 1] === '.')) {
    price = price.slice(0, -1);
  }

  return price;
}
