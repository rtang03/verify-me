import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import React from 'react';
import Error from './Error';
import Success from './Success';

type Result = {
  data: any;
  error: any;
  loading: boolean;
};
const ResultComponent: React.FC<{ isTenantExist: boolean; result: Result }> = ({
  isTenantExist,
  result,
}) => (
  <>
    {isTenantExist && !result?.loading && result?.data && (
      <CardContent>
        <Divider />
        <Success />
      </CardContent>
    )}
    {isTenantExist && !result?.loading && result?.error && (
      <CardContent>
        <Divider />
        <Error error={result.error} />
      </CardContent>
    )}
  </>
);

export default ResultComponent;
