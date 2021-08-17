# verify-me

auth0 callback for Registra application when using next-auth
`http://localhost:3000/api/auth/callback/auth0`

idtoken format

```json
{
  "sub": "auth0|6059aed4aa7803006a20d824",
  "nonce": "foobar",
  "at_hash": "TmQxzKISmVJef8D_2xRYfQ",
  "c_hash": "4ymVi1DdQYxKrjgqgFdmHA",
  "aud": "2843faca-8911-45ac-b605-f15c5556b88e",
  "exp": 1625765183,
  "iat": 1625761583,
  "iss": "https://issuer.example.com/oidc/issuers/0ac6d292-1868-44d3-a161-923052e11fb8"
}
```

accesstoken

```json
{
"urn:oidc-provider:example:foo": "bar", <=== ADD by ProviderConfiguration extra token claim
"jti": "Yd5U9TkqOAOrKb-1tukKs",
"sub": "auth0|6059aed4aa7803006a20d824", ==== OK
"iat": 1625761583,
"exp": 1625768783,
"scope": "openid email", <==== ADD by resourceindicator
"client_id": "2843faca-8911-45ac-b605-f15c5556b88e",
"iss": "https://issuer.example.com/oidc/issuers/0ac6d292-1868-44d3-a161-923052e11fb8",
"aud": "https://issuer.example.com" <===== WRONG
}
```

### Useful command

```shell
sudo lsof -i :5432

https://coderwall.com/p/b443ng/generating-a-self-signed-wildcard-certificate
openssl genrsa 2048 > host.key
openssl req -new -x509 -nodes -sha1 -days 3650 -key host.key > host.crt
```

### Useful Info

- https://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express
- https://github.com/node-fetch/node-fetch/issues/19
- https://developer.uport.me/flows/selectivedisclosure
- https://developer.uport.me/messages/sharereq
- https://github.com/async-labs/saas/tree/master/saas/api
- https://github.com/bcgov/vc-authn-oidc/tree/master/docs
- https://github.com/animo/awesome-self-sovereign-identity
- https://github.com/bcgov/vc-authn-oidc/tree/master/docs
- https://github.com/veramolabs/agent-explorer/blob/main/src/components/standard/CreateResponse.tsx
- https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
- [TypeORM bug](https://github.com/typeorm/typeorm/pull/4257/commits/781e77b15f929286c30bb17c9b12afd0d756395f)
- https://dashslab.us.auth0.com/v2/logout?client_id=cGExcP4cy3eljzlhghBhToRP46bP3bLY&returnTo=google.com
- https://darutk.medium.com/illustrated-device-flow-rfc-8628-d23d6d311acc
- https://darutk.medium.com/ciba-a-new-authentication-authorization-technology-in-2019-explained-by-an-implementer-d1e0ac1311b4
- https://github.com/panva/node-oidc-provider/blob/main/example/my_adapter.js
- https://github.com/panva/node-openid-client/tree/main/docs
- https://learn.mattr.global/api-reference/v1.0.1#tag/OIDC-Verifier-Client
- https://github.com/mattrglobal/sample-apps/blob/main/oidc-client-react/package.json
- https://github.com/wso2/product-is/issues/6835
- https://github.com/bcgov/vc-authn-oidc/tree/master/docs
- https://datatracker.ietf.org/doc/html/draft-madden-jose-ecdh-1pu-03
- https://github.com/hyperledger/aries-rfcs/blob/master/features/0334-jwe-envelope/README.md
- https://medium.com/@CreatorNader/introducing-oidc-credential-provider-7845391a9881
- https://openid.net/specs/openid-connect-self-issued-v2-1_0.html
