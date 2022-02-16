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
RP->Oidc_verifier: request to /backchannel
activate Oidc_verifier
Oidc_verifier->Oidc_verifier: validateBindingMessage
Oidc_verifier->Oidc_verifier: processLoginHint
Oidc_verifier->Oidc_verifier: verifyUserCode (disabled)
Oidc_verifier->Oidc_verifier: triggerAuthenticationDevice \n - get by presReqTemplateId\n - create presReq 
Oidc_verifier-->RP: auth_request_id
RP->Oidc_verifier: get presentation request
Oidc_verifier-->RP: presentation request
RP-->Browser: display qr code
== IdentityWallet Communication ==
loop until timeout
    RP->RP: wait client_notification
end
Browser->Wallet: scan qr code (ref to pres-req-templ)
Wallet->Oidc_verifier: create SDR
Oidc_verifier-->Wallet: SDR
Wallet->Wallet: search VC by loginHint\n with bindingMessage, \naccountId & userCode
Wallet->User: present verify data request
User-->Wallet: client accept request
Wallet->Wallet: create VP/didcomm
Wallet->Oidc_verifier: VP-Auth request
Oidc_verifier->Oidc_verifier: Get or create Grant 
Oidc_verifier->Oidc_verifier: map vp to idToken
Oidc_verifier->Oidc_verifier: validate and verify VC
Oidc_verifier->Oidc_verifier: save VP / VC
Oidc_verifier->Oidc_verifier: finish backChannelResult 
Oidc_verifier->RP: notify\nclient_notification_endpoint
deactivate Oidc_verifier
== Authenticated ==
RP->Oidc_verifier: POST /token
Oidc_verifier-->RP: id_token\naccess_token
RP->Oidc_verifier: access_token to /userinfo
Oidc_verifier-->RP: Userinfo with VP
deactivate RP
RP-->Browser: success web page
```

source: https://learn.mattr.global/tutorials/verify/oidc-bridge/setup-sample-oidc-client
