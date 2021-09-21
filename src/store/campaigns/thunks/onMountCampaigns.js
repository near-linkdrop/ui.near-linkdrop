import { thunk } from 'easy-peasy';
import { getUserContract } from '../helpers/getUserContract';
import { getCampaignContract } from '../helpers/getCampaignContract';

export const onMountCampaigns = thunk(async (_, __, { getStoreState, getStoreActions }) => {
  const state = getStoreState();
  const walletUserId = state.general.user.currentAccount;
  const linkdropUserId = state.general.user.accounts[walletUserId].linkdrop.accountId;

  const actions = getStoreActions();
  const mountCampaigns = actions.campaigns.mountCampaigns;
  const setError = actions.general.setError;

  const user = getUserContract(state, linkdropUserId);

  try {
    const campaignIds = await user.get_campaigns();
    const campaigns = await Promise.all(
      campaignIds.map((campaignId) =>
        getCampaignContract(state, campaignId).get_campaign_metadata(),
      ),
    );

    mountCampaigns({ campaignIds, campaigns });
  } catch (e) {
    setError({ isError: true, description: e });
  }
});
