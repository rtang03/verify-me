import CardContent from '@material-ui/core/CardContent';
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
        <br />
        <Success />
      </CardContent>
    )}
    {isTenantExist && !result?.loading && result?.error && (
      <CardContent>
        <br />
        <Error error={result.error} />
      </CardContent>
    )}
  </>
);

export default ResultComponent;
