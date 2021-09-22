import { thunk } from 'easy-peasy';
import BN from 'bn.js';
import { Account } from 'near-api-js';
import { getCampaignContract } from '../../helpers/getContracts';
import { getKeysFromMnemonic } from '../helpers/getKeysFromMnemonic';
import { getPagesRange, getPagination } from '../helpers/getPagination';
import { nearConfig } from '../../../config/nearConfig';

const createDeleteKeysIterator = ({
  firstPage,
  lastPage,
  total,
  elementsPerPage,
  mnemonic,
  campaign,
  internalCampaignId,
}) => ({
  async *[Symbol.asyncIterator]() {
    for (let page = firstPage; page <= lastPage; page += 1) {
      const { range } = getPagination({ page, total, elementsPerPage });

      const keys = await getKeysFromMnemonic({
        mnemonic,
        start: range.start,
        end: range.end,
        internalCampaignId,
      });

      await campaign.clear_state({
        args: { keys: keys.map(({ pk }) => pk) },
        gas: new BN('300000000000000'),
      });

      yield page;
    }
  },
});

export const onDeleteCampaign = thunk(async (_, payload, { getStoreState, getStoreActions }) => {
  const { campaignId, onFinishDeleting, setProgress } = payload;

  const state = getStoreState();
  const near = state.general.entities.near;
  const keyStore = state.general.entities.keyStore;
  const walletUserId = state.general.user.currentAccount;
  const mnemonic = state.general.user.accounts[walletUserId].linkdrop.mnemonic;
  const total = state.campaigns.map[campaignId].keysStats.total;
  const internalCampaignId = state.campaigns.map[campaignId].internalCampaignId;

  const actions = getStoreActions();
  const deleteCampaign = actions.campaigns.deleteCampaign;

  const account = new Account(near.connection, campaignId);
  const campaign = getCampaignContract(state, campaignId);

  const elementsPerPage = 30; // TODO move to config
  const { firstPage, lastPage } = getPagesRange(total, elementsPerPage);

  const iterator = createDeleteKeysIterator({
    firstPage,
    lastPage,
    total,
    elementsPerPage,
    mnemonic,
    campaign,
    internalCampaignId,
  });

  for await (const chunk of iterator) {
    setProgress(Math.trunc(Math.min((chunk / lastPage) * 100, 99)));
  }

  await account.deleteAccount(walletUserId);
  await keyStore.removeKey(nearConfig.networkId, campaignId);
  deleteCampaign(campaignId);
  onFinishDeleting();
});
