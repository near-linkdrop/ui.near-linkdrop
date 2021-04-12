import { makeStyles } from '@material-ui/core';

const styles = (theme) => ({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: ' column',
    alignItems: 'center',
  },
  body: {
    width: 680,
    display: 'flex',
    flexDirection: ' column',
    alignItems: 'center',
  },
  emojiContainer: {
    height: 120,
    width: 120,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    border: '1px solid',
    borderColor: theme.colors.dividerOnWhite,
    marginTop: 40,
  },
  emoji: {
    fontSize: 72,
  },
  inputs: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 36,
  },
  name: {
    marginBottom: 36,
  },
  totalLinks: {
    width: '48%',
  },
  divider: {
    width: '100%',
    margin: '28px 0',
  },
  actions: {
    width: '100%',
    height: 72,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderTop: `1px solid ${theme.colors.dividerOnWhite}`,
  },
  next: {
    width: 208,
  },
});

export const useStyles = makeStyles(styles, { name: 'Step1' });
