import { nearConfig } from '../../../../../../../config/nearConfig';
import { useStyles } from './Link.styles';
import { LinkStatus } from '../../../general/LinkStatus/LinkStatus';
import { keyStatus } from '../../../../../../../config/keyStatus';
import { Qr } from '../../../general/Actions/Qr/Qr';
import { RefundLink } from '../../../general/Actions/RefundLink/RefundLink';
import { CopyToClipboard } from '../../../../../general/CopyToClipboard/CopyToClipboard';

export const Link = ({
  link: { pk, sk, order, status },
  tokensPerKey,
  campaignId,
  walletUserId,
}) => {
  const classes = useStyles();
  const isActive = status === keyStatus.active;
  const link = nearConfig.getCreateAccountAndClaimLink(sk, campaignId)

  return (
    <div className={classes.container}>
      <div className={classes.statusBar}>
        <LinkStatus status={status} />
        <span>#{order}</span>
      </div>

      {isActive && (
        <div className={classes.actions}>
          <CopyToClipboard
            classNames={{
              icon: classes.copyButtonIcon,
              tooltip: classes.tooltip
            }}
            value={link}
          />
          <Qr order={order} sk={sk} campaignId={campaignId}/>
          <RefundLink
            pk={pk}
            campaignId={campaignId}
            tokensPerKey={tokensPerKey}
            walletUserId={walletUserId}
          />
        </div>
      )}
    </div>
  );
};
