# Authenticate a DID using bridge

This flow does not require federated oidc provider

```plantuml
Title: Authenticate a did using oidc bridge
== Prepare Auth Req ==
User->Browser: go to RP website
Browser->RP: Fetch RP website
RP-->Browser: return website
Browser->RP: prepare ciba request
RP->RP: generate challenge
RP->RP: generate login_hint
RP->RP: generate user_code
RP-->Browser: ciba request objecct
== CIBA request ==
Browser->RP: submit ciba request
activate RP
RP->Oidc_verifier: push request to /par
activate Oidc_verifier
Oidc_verifier-->RP: OK
RP->Oidc_verifier: request to /backchannel
Oidc_verifier->Oidc_verifier: get verifier's did
Oidc_verifier->Oidc_verifier: create pres\nreq template
Oidc_verifier->Oidc_verifier: pack pres req\ntemplate to Jwm
Oidc_verifier-->RP: auth_request_id
RP->Oidc_verifier: get press-req-templ
Oidc_verifier-->RP: ref to pres-req-templ
RP-->Browser: display qr code
== IdentityWallet Communication ==
Browser->Wallet: scan qr code (ref to pres-req-templ)
loop
    RP->Oidc_verifier: "ping" /token
    Oidc_verifier-->RP: auth pending response
end
Wallet->Oidc_verifier: GET pres-req-templ
Oidc_verifier-->Wallet: pres-req-templ
Wallet->Oidc_verifier: create SDR
Oidc_verifier-->Wallet: SDR
Wallet->Wallet: search VC
Wallet->User: present verify data request
User-->Wallet: client accept request
Wallet->Wallet: create VP/didcomm
Wallet->Oidc_verifier: didComm send
Oidc_verifier->Oidc_verifier: map vp to idToken
Oidc_verifier->Oidc_verifier: save VP / VC
Oidc_verifier->RP: notify\nclient_notification_endpoint
deactivate Oidc_verifier
== Authenticated ==
RP->Oidc_verifier: "ping" /token
Oidc_verifier-->RP: id_token\naccess_token
RP->Oidc_verifier: access_token to /userinfo
Oidc_verifier-->RP: Userinfo with VP
deactivate RP
RP-->Browser: success web page
```

source: https://learn.mattr.global/tutorials/verify/oidc-bridge/setup-sample-oidc-client
