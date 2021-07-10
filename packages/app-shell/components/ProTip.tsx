import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import SvgIcon from '@material-ui/core/SvgIcon';
import { red, blue } from '@material-ui/core/colors';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import React, { ReactFragment } from 'react';

const LightBulbIcon = (props: React.ComponentProps<any>) => (
  <SvgIcon {...props}>
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
  </SvgIcon>
);

const useStyles = makeStyles((theme: Theme) => {
  const dark = theme.palette.type === 'dark';
  const grey = theme.palette.grey;

  return createStyles({
    root: {
      margin: theme.spacing(1, 0, 1),
    },
    card: {
      backgroundColor: dark ? grey[700] : grey[100],
      'border-color': dark ? grey[300] : grey[700],
      'border-left': `8px solid ${theme.palette.divider}`,
      'border-right': `0px`,
      'border-top': `0px`,
      'border-bottom': `0px`,
    },
    lightBulb: {
      'font-size': 'large',
      color: blue[500],
      verticalAlign: 'middle',
      marginRight: theme.spacing(1),
    },
    danger: {
      color: red[500],
      verticalAlign: 'middle',
      marginRight: theme.spacing(1),
    },
  });
});

const ProTip: React.FC<{ text: string | ReactFragment; tipType?: string }> = ({
  text,
  tipType = 'lightBulb',
}) => {
  const classes = useStyles();

  const icon = {
    danger: <ReportProblemOutlinedIcon className={classes.danger} />,
  }[tipType] || <LightBulbIcon className={classes.lightBulb} />;

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        className={classes.root}
        avatar={icon}
        title={
          <div className={classes.root} color="inherit">
            {text}
          </div>
        }
      />
    </Card>
  );
};

export default ProTip;
