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

Step:
Start RP (not ready)
Start Server
Create issuer.exampel.com

### Authenticate a DID using bridge

```plantuml
Title: Authenticate a did using oidc bridge
user->browser: go to RP website
browser->oidc_client: Fetch RP website
oidc_client-->browser: return website
browser->oidc_client: create oidc\nauth request
oidc_client->oidc_client: generated challenge
oidc_client-->browser: redirect to\noidc auth request
browser->oidc_verifier: Follow oidc auth request
note left: scope=openid_credential_pres
oidc_verifier->verifier_agent: get Did document
verifier_agent-->oidc_verifier: Did
oidc_verifier->oidc_verifier: generate presentation template
oidc_verifier-->oidc_client: QR code\n(ref to jwm/pres-request)
oidc_client-->browser: QR code
== IdentityWallet Communication ==
browser->wallet: scan qr code (presentation request)
loop
    browser->oidc_verifier: request challenge status
    oidc_verifier-->browser: auth pending response
end
wallet->oidc_verifier: get pres req templ
oidc_verifier-->wallet: pres req templ\n(e.g. DidAuth type)
wallet->wallet: create Did
wallet->wallet: optionally, credential
wallet->user: present verify data request
user->wallet: client accept request
wallet->wallet: generate\npresentation
wallet->oidc_verifier: submit presentation
oidc_verifier->oidc_verifier: map vp to idToken
browser->oidc_verifier: request challenge status
== Oauth Flow ==
oidc_verifier->browser: redirect request\nto RP redirect uri with code
browser->oidc_client: follow redirect with code
note left: localhost/callback
oidc_client->oidc_verifier: oauth code
oidc_verifier-->oidc_client: return id_token\naccess_token
oidc_client-->browser: success web page
@enduml
```
