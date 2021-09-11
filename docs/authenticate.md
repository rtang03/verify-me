# Authenticate a DID using bridge

This flow does not require federated oidc provider

```plantuml
Title: Authenticate a did using oidc bridge
== Prepare Auth Req ==
User->Browser: go to RP website
Browser->RP: Fetch RP website
RP-->Browser: return website
Browser->RP: create oidc\nauth request
RP->RP: generated challenge
RP-->Browser: redirect to\noidc auth request
== Authorize ==
Browser->Oidc_verifier: send auth-request to /auth
note left: scope=openid_credential_pres
Oidc_verifier->Oidc_verifier: get Did document
Oidc_verifier->Oidc_verifier: generate presentation template
Oidc_verifier-->RP: ref to jwm/pres-request
RP-->Browser: QR code
== IdentityWallet Communication ==
Browser->Wallet: scan qr code (presentation request)
loop
    Browser->Oidc_verifier: request challenge status
    Oidc_verifier-->Browser: auth pending response
end
Wallet->Oidc_verifier: get pres req templ
Oidc_verifier-->Wallet: pres req templ\n(e.g. DidAuth type)
Wallet->Wallet: create ephemeral DID
Wallet->Wallet: optionally, credential
Wallet->User: present verify data request
User->Wallet: client accept request
Wallet->Wallet: generate\npresentation
Wallet->Oidc_verifier: submit presentation
Oidc_verifier->Oidc_verifier: map vp to idToken
Oidc_verifier->Oidc_verifier: persiste presentation
Browser->Oidc_verifier: request challenge status
Oidc_verifier->Browser: redirect request\nto RP redirect uri with code
Browser->RP: follow redirect with code
note left: localhost/callback
RP->Oidc_verifier: oauth code
Oidc_verifier-->RP: return id_token\naccess_token
Note right of Oidc_verifier: assume opague token
RP->Oidc_verifier: present token to Userinfo
Oidc_verifier-->RP: Userinfo for presentation
RP-->Browser: success web page
```

source: https://learn.mattr.global/tutorials/verify/oidc-bridge/setup-sample-oidc-client
