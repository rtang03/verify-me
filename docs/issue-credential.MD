# Issue credential using bridge

It retrieves claim from oidc_provider, and translate into vc;
to be stored in wallet, for later use.

```plantuml
title: Issue credential using oidc bridge
User->Browser: fetch website
Browser->RP: fetch client website
RP-->Browser: website
Browser->RP: request credential offer
RP->Oidc_issuer: prepare
Oidc_issuer-->RP: credential offer
RP-->Browser: qr code\nref to credential offer
Browser->Wallet: scan
== Construct credential request ==
Wallet->User: show available offer
User-->Wallet: confirm to kick off interaction
Wallet->Wallet: code_challenge\nnonce\nstate
Wallet->Wallet: create ephemeral DID
Wallet->Oidc_issuer: retrieve credential-request
Oidc_issuer-->Wallet: credential-request
== Authorize ==
Wallet->Oidc_issuer: send credential-request\nto /auth
Oidc_issuer->Oidc_issuer: retrieve client\nkick off interaction
Oidc_issuer->Federated_Idp:fetch openId-config
Federated_Idp-->Oidc_issuer: openId-config
Oidc_issuer->Federated_Idp: federate auth request
Federated_Idp-->Wallet: webview login
Wallet->Federated_Idp: login request
Federated_Idp-->Oidc_issuer: id_token
Oidc_issuer->Federated_Idp: validate id_token signature
Federated_Idp-->Oidc_issuer: id_token validation
Oidc_issuer->Oidc_issuer: validate state & nonce
== Confirm ==
Oidc_issuer->Wallet: confirmation screen with id_token
Wallet->Oidc_issuer: confirm with id_token
Oidc_issuer->Federated_Idp:fetch openId-config
Federated_Idp-->Oidc_issuer: openId-config
Oidc_issuer->Federated_Idp: validate id_token signature again
Federated_Idp-->Oidc_issuer: id_token validation
Oidc_issuer->Oidc_issuer: get or create Grant
Oidc_issuer->Oidc_issuer: mapping from OidcClaim\n to JsonLdterm
Oidc_issuer->Oidc_issuer: create and save VC
Oidc_issuer-->Wallet: redirect with signed response
Wallet->Wallet: decode response to code
Wallet->Oidc_issuer: exchange code
Oidc_issuer->Oidc_issuer: retrieve VC\nappend to id_token
Oidc_issuer-->Wallet: id_token & access_token
Wallet->User: render screen of avaliable VC
User-->Wallet: confirm VC creation
Wallet->Oidc_issuer: get /userInfo with\naccess_token and code_verifier
Oidc_issuer->Oidc_issuer: retrieve VC\nappend to userInfo
Oidc_issuer-->Wallet: userInfo
Wallet->Wallet: create VC
```

### Notes:
- did and sub_jwk in the credential request is provided by Wallet; which is not verified in Oidc_issuer, when submitting.
- Currently use client_secret_post
- userInfo is not a signed object
- access_token is not doing client authentication check
- PKCE is supported
