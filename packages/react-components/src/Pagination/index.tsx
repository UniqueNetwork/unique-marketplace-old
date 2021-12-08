// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Input, InputOnChangeData } from 'semantic-ui-react';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';

import { Dropdown } from '@polkadot/react-components';
import Arrow from '@polkadot/react-components/ListComponent/image/arrow.svg';

interface Props {
  page: number;
  itemsCount: number;
  perPage: number;
  onChangePage: (page: number) => void;
  onChangePageSize: (pageSize: number) => void;
}

function Pagination (props: Props): React.ReactElement<Props> {
  const { itemsCount, onChangePage, onChangePageSize, page, perPage } = props;

  const [goToPageValue, setGoToPageValue] = useState<number>(1);

  const pageSizeOptions = useRef([{ text: '20', value: 20 }, { text: '50', value: 50 }, { text: '100', value: 100 }]).current;

  const lastPage = useMemo(() => Math.ceil(itemsCount / perPage), [itemsCount, perPage]);

  const pages: ('...' | number)[] = useMemo(() => {
    const pagesRangeGenerator = function * () {
      let i = 1;

      while (i <= lastPage) {
        // check a page is at the beginning or at the end or around the current page
        if (i <= 2 || i >= lastPage - 1 || (i >= page - 2 && i <= page + 2)) {
          yield i;
        } else if (i === 3 || i === page + 3) {
          yield '...';
        }

        i++;
      }
    };

    return [...pagesRangeGenerator()];
  }, [page, lastPage]);

  const _onChangePageSize = useCallback((_pageSize: number) => {
    onChangePageSize && onChangePageSize(_pageSize);
  }, [onChangePageSize]);

  const _onChangePage = useCallback((_page: number) => () => {
    onChangePage && onChangePage(_page);
  }, [onChangePage]);

  const _onPrevPage = useCallback(() => {
    if (page === 1) return;
    onChangePage && onChangePage(page - 1);
  }, [onChangePage, page]);

  const _onNextPage = useCallback(() => {
    if (page === lastPage) return;
    onChangePage && onChangePage(page + 1);
  }, [page, lastPage, onChangePage]);

  const _onGoToChange = useCallback((_, { value }: InputOnChangeData) => {
    const _goToPageValue = parseInt(value, 10);

    if (Number.isInteger(_goToPageValue) && _goToPageValue > 0 && _goToPageValue <= lastPage) {
      setGoToPageValue(_goToPageValue);
      onChangePage && onChangePage(_goToPageValue);
    }
  }, [onChangePage, setGoToPageValue, lastPage]);

  return <div className='pagination'>
    <div className='pagination__page'>
      <div className='pagination__total'>{itemsCount} items</div>
      <div className='pagination__on-page'>
        On page:
        <Dropdown
          defaultValue={20}
          onChange={_onChangePageSize}
          options={pageSizeOptions}
          value={perPage}
        />
      </div>
    </div>
    <div className='pagination__pagination'>
      {page !== 1 && <div className='pagination__arrows'>
        <a
          className='pagination__back'
          onClick={_onPrevPage}
        >
          <Image src={Arrow} />
        </a>
      </div>}
      <ul className='pagination__pages'>
        {pages.map((item, index) => (
          <li
            className={item === page ? 'active' : item === '...' ? 'dots' : undefined}
            key={`page-item-${item}-${index}`}
          >
            {!(item === page || item === '...')
              ? <a onClick={_onChangePage(item)}>{item}</a>
              : item}
          </li>
        ))}
      </ul>
      <div className='pagination__arrows'>
        {!(page === lastPage || itemsCount === 0) &&
        <a
          className='pagination__forward'
          onClick={_onNextPage}
        >
          <Image src={Arrow} />
        </a>}
      </div>
      <div className='pagination__goto'>
        Go to
        <Input
          disabled={itemsCount === 0}
          onChange={_onGoToChange}
          type={'number'}
          value={goToPageValue}
        />
      </div>
    </div>
  </div>;
}

export default React.memo(Pagination);
