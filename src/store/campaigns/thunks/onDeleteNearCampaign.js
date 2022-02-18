import { thunk } from 'easy-peasy';
import BN from '../../../../node_modules/bn.js/lib/bn';
import { nearConfig } from '../../../config/nearConfig';
import { getCampaignContract } from '../../helpers/getContracts';
import { getPagesRange, getPagination } from '../helpers/getPagination';
import { getKeysFromMnemonic } from '../helpers/keys/getKeysFromMnemonic';

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

export const onDeleteNearCampaign = thunk(async (_, payload, { getStoreState, getStoreActions }) => {
  const { campaignId, onFinishDeleting, setProgress } = payload;

  const state = getStoreState();
  const keyStore = state.general.entities.keyStore;
  const walletUserId = state.general.user.wallet.accountId;
  const mnemonic = state.general.user.linkdrop.mnemonic;
  const total = state.campaigns.campaign.keysStats.total
  const internalCampaignId = state.campaigns.campaign.internalCampaignId
  const actions = getStoreActions();
  const deleteCampaign = actions.campaigns.deleteCampaign;
  const setError = actions.general.setError;

  const campaign = getCampaignContract(state, campaignId);
  const elementsPerPage = 30;
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

  try {
    for await (const chunk of iterator) {
      setProgress(Math.trunc(Math.min((chunk / lastPage) * 100, 99)));
    }

    await campaign.delete_campaign({
      args: { beneficiary_id: walletUserId },
      gas: new BN('50000000000000'),
    });

    await keyStore.removeKey(nearConfig.networkId, campaignId);
    deleteCampaign(campaignId);
    onFinishDeleting();
  } catch (e) {
    setError({ description: e.message });
  }
});
