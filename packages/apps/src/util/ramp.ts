import {RampInstantSDK} from '@ramp-network/ramp-instant-sdk';
import {IHostConfig} from '@ramp-network/ramp-instant-sdk/dist/types/types';

const ksmSymbol = 'KSM';

export const onRamp = async (userAddress: string) => {
  if (!userAddress) {
    return
  }

  const config: IHostConfig = {
    hostAppName: 'Artpool',
    hostLogoUrl: 'https://acg-public.s3.eu-west-2.amazonaws.com/branding/artpool.svg',
    swapAsset: ksmSymbol,
    userAddress: userAddress,
  };

  if (process.env.NODE_ENV === "development") {
    console.log("Using staging environment for ramp");
    config.url = "https://ri-widget-staging.firebaseapp.com/"
  }

  new RampInstantSDK(config).on('*', event => console.debug(event)).show();
};
