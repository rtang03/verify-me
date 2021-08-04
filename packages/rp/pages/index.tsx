import Button from '@material-ui/core/Button';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import Image from 'next/image';
import React from 'react';
import { useFetcher } from '../utils';

const IndexPage: NextPage<any> = () => {
  const { val, poster } = useFetcher<{ sdr: string; challenge: string }>();
  const replyUrl = process.env.NEXT_PUBLIC_REPLY_URL;
  const issuerUrl = process.env.NEXT_PUBLIC_ISSUER_URL;
  const issuerDid = process.env.NEXT_PUBLIC_ISSUER_DID;
  const subjectDid = process.env.NEXT_PUBLIC_SUBJECT_DID;
  const newRequest = (body: any) => poster(`/api/request`, body);
  const removeHttps = (url?: string) => url?.replace('https://', '');
  const requestPayload = (sdr: string, challenge: string) =>
    `didcomm://${removeHttps(replyUrl)}?request=${sdr}&challenge=${challenge}`;

  return (
    <Formik
      initialValues={{}}
      onSubmit={async (_, { setSubmitting }) => {
        setSubmitting(true);
        await newRequest({
          data: {
            issuer: issuerDid,
            subject: subjectDid,
            claims: [
              {
                claimType: 'auth',
                issuers: [
                  {
                    did: issuerDid,
                    url: issuerUrl,
                  },
                ],
                essential: true,
                reason: 'authentication request',
              },
            ],
            replyUrl,
          },
        });
        setSubmitting(false);
      }}>
      {({ isSubmitting }) => (
        <Form>
          <div>Let me in</div>
          <Button variant="contained" color="primary" type="submit">
            VC-AuthN Request with OIDC Client
          </Button>
          {val?.data?.sdr && (
            <>
              <br />
              Challenge: {val.data.challenge}
              <br />
              <Image
                width={300}
                height={300}
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${requestPayload(
                  val.data.sdr,
                  val.data.challenge
                )}`}
              />
            </>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default IndexPage;
