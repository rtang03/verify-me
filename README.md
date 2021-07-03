# verify-me

sudo lsof -i :5432

https://coderwall.com/p/b443ng/generating-a-self-signed-wildcard-certificate
openssl genrsa 2048 > host.key
openssl req -new -x509 -nodes -sha1 -days 3650 -key host.key > host.crt

https://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express
https://github.com/node-fetch/node-fetch/issues/19
https://developer.uport.me/flows/selectivedisclosure
https://developer.uport.me/messages/sharereq

TypeORM bug
https://github.com/typeorm/typeorm/pull/4257/commits/781e77b15f929286c30bb17c9b12afd0d756395f

https://undraw.co/illustrations

https://github.com/async-labs/saas/tree/master/saas/api
https://github.com/bcgov/vc-authn-oidc/tree/master/docs
https://github.com/animo/awesome-self-sovereign-identity
https://github.com/bcgov/vc-authn-oidc/tree/master/docs
https://github.com/veramolabs/agent-explorer/blob/main/src/components/standard/CreateResponse.tsx
https://developer.uport.me/flows/selectivedisclosure
https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth

auth0 callback for Registra application when using next-auth
http://localhost:3000/api/auth/callback/auth0

https://localhost/oidc/issuers/bb41301f-0fc6-406d-ac34-3afeb003769e/callback

Interaction {
returnTo: 'https://issuer.example.com/oidc/issuers/bb41301f-0fc6-406d-ac34-3afeb003769e/auth/FbwEVmrFS-A9fmPasnXEl',
prompt: { name: 'login', reasons: [ 'no_session' ], details: {} },
lastSubmission: undefined,
params: {
client_id: 'foo',
nonce: 'foobar',
redirect_uri: 'https://jwt.io',
response_type: 'id_token',
scope: 'openid'
},
session: undefined,
kind: 'Interaction',
jti: 'FbwEVmrFS-A9fmPasnXEl',
exp: 1624963821
}

https://dashslab.us.auth0.com/v2/logout?client_id=cGExcP4cy3eljzlhghBhToRP46bP3bLY&returnTo=google.com
