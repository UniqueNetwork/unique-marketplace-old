import './styles.scss';

import React, {useCallback, useMemo, useState} from "react";
import {Dropdown, InputNumber} from "@polkadot/react-components";
import Image from "semantic-ui-react/dist/commonjs/elements/Image";
import Arrow from "@polkadot/react-components/ListComponent/image/arrow.svg";
import BN from "bn.js";

interface Props {
  page: number;
  itemsCount: number;
  perPage: number;
  onChangePage: (page: number) => void;
  onChangePageSize: (pageSize: number) => void;
}

function Pagination (props: Props): React.ReactElement<Props> {
  const {itemsCount, page, perPage, onChangePage, onChangePageSize} = props;

  const [goToPageValue, setGoToPageValue] = useState<number>(1);

  const pageSizeOptions = useMemo(() => [{text: '20', value: 20}, {text: '50', value: 50}, {text: '100', value: 100}], []);

  const lastPage = useMemo(() => Math.ceil(itemsCount / perPage), [itemsCount, perPage]);

  const pages: ('...' | number)[] = useMemo(() => {

    const pagesRangeGenerator = function* (){
      let i = 1;
      while (i <= lastPage) {
        // check a page is at the beginning or at the end or around the current page
        if (i <= 2 || i >= lastPage - 1 || (i >= page - 2 && i <= page + 2)) {
          yield i;
        } else if(i === 3 || i === page + 3) {
          yield '...';
        }
        i++;
      }
    };
    return [...pagesRangeGenerator()];
  }, [page, lastPage]);

  const _onChangePageSize = useCallback((_pageSize: number) => {
    onChangePageSize && onChangePageSize(_pageSize);
  }, [])

  const _onChangePage = useCallback((_page: number) => {
    onChangePage && onChangePage(_page);
  }, [])

  const _onPrevPage = useCallback(() => {
    if(page === 1) return;
    onChangePage && onChangePage(page - 1);
  }, [page]);

  const _onNextPage = useCallback(() => {
    if(page === lastPage) return;
    onChangePage && onChangePage(page + 1);
  }, [page, lastPage]);

  const _onGoToChange = useCallback(() => {
    if(goToPageValue && goToPageValue > 0 && goToPageValue <= lastPage) {
      onChangePage && onChangePage(goToPageValue);
    }
  }, [goToPageValue])

  return <div className='pagination'>
    <div className='pagination__page'>
      <div className='pagination__total'>{itemsCount} items</div>
      <div className='pagination__on-page'>
        On page:
        <Dropdown
          defaultValue={20}
          value={perPage}
          options={pageSizeOptions} onChange={_onChangePageSize} />
      </div>
    </div>
    <div className='pagination__pagination'>
      {page !== 1 && <div className='pagination__arrows'>
        <a className='pagination__back'  onClick={_onPrevPage}>
          <Image src={Arrow} />
        </a>
      </div>}
      <ul className='pagination__pages'>
        {pages.map((item, index) => (
        <li
          key={'page-item-' + item + index}
          className={item === page ? 'active' : item === '...' ? 'dots' : undefined}
        >
          {!(item === page || item === '...') ? <a onClick={() => _onChangePage(item)}>{item}</a>
          : item}
        </li>
        ))}
      </ul>
      <div className='pagination__arrows'>
        {!(page === lastPage || itemsCount === 0) && <a className='pagination__forward' onClick={_onNextPage}>
          <Image src={Arrow} />
        </a>}
      </div>
      <div className='pagination__goto'>
        Go to
        <InputNumber
          defaultValue={'1'}
          value={new BN(goToPageValue)}
          onChange={(value: BN) => value && setGoToPageValue(value.toNumber())}
          isZeroable={false}
          isDisabled={itemsCount === 0}
          onEnter={_onGoToChange}
        />
      </div>
    </div>
  </div>;
}

export default React.memo(Pagination);
