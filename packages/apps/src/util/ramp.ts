import {RampInstantSDK} from '@ramp-network/ramp-instant-sdk';

const ksmSymbol = 'KSM';

export const onRamp = async (userAddress: string) => {
  if (!userAddress) {
    return
  }

  new RampInstantSDK({
    hostAppName: 'Artpool',
    hostLogoUrl: 'https://acg-public.s3.eu-west-2.amazonaws.com/branding/artpool.svg',
    swapAsset: ksmSymbol,
    userAddress: userAddress,
    url: 'https://ri-widget-staging.firebaseapp.com/'
  }).on('*', event => console.debug(event)).show();
};
