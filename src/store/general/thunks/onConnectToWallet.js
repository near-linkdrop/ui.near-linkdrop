import { thunk } from 'easy-peasy';
import { routes } from '../../../ui/config/routes';

export const onConnectToWallet = thunk(async (_, __, { getStoreState, getStoreActions }) => {
  const store = getStoreState();
  const wallet = store.general.entities.wallet;
  const actions = getStoreActions();
  const connectToWallet = actions.general.connectToWallet;

  await wallet.requestSignIn({
    successUrl: `${window.location.origin}${routes.redirectFromWallet}?connectWallet=true&success=true`,
    failureUrl: `${window.location.origin}${routes.redirectFromWallet}?connectWallet=true&errorCode=true`,
  });

  connectToWallet({
    isConnected: wallet.isSignedIn(),
    accountId: wallet.getAccountId(),
  });
});
