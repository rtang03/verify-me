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


https://jwt.io/#code=g3M49sKawC9zeSr1-Ovm1MShmn_j8Q4LkfR7l8vRQIs&id_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleXN0b3JlLUNIQU5HRS1NRSJ9.eyJzdWIiOiJhdXRoMHw2MDU5YWVkNGFhNzgwMzAwNmEyMGQ4MjQiLCJub25jZSI6ImZvb2JhciIsImF0X2hhc2giOiJuLVJScFJBV1JSalJEelZqQ0JIZW9nIiwiY19oYXNoIjoicER3dlF3Z04wb1lva3hJeXBiZlR6ZyIsImF1ZCI6IjI4NDNmYWNhLTg5MTEtNDVhYy1iNjA1LWYxNWM1NTU2Yjg4ZSIsImV4cCI6MTYyNTc1OTk2NiwiaWF0IjoxNjI1NzU2MzY2LCJpc3MiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLmNvbS9vaWRjL2lzc3VlcnMvMGFjNmQyOTItMTg2OC00NGQzLWExNjEtOTIzMDUyZTExZmI4In0.vJ7M8Q1mpLLyQRxrJr5Qacnp4QWPVoBo6G_n1yPkATxt8wfnvDj7MR04xOh3axAiA9_dLcJrUJ9xC666A-HOJJ9loxm-vr-IpxhWXZZGA8hpqYocaCgkgYQe0IsEyMMB-3oBIDCE1QMoy5kfD_MZ9bIrGtwjDLakRvO6exz98M79gs7dNXTKeLy81__IIFMDS08tHiD93W-QoJQIOM2Gxn_4CO2zD8QJJQ4lI3A9LOF5lQx-kM56epoX4cOicbDxxHWDWtgjsjHVaWtxb2gq71qgPHwQrZo7Z_qhgXJ9YzO0ZhUyGU__qKHuvfE1mkeT_BjHYVcri_XvN6N31qBvew&access_token=KpYaZyIQ01VeB6y36-dVYrI6zsZ-GguxD7Jbg7RXVsD&expires_in=3600&token_type=Bearer&scope=openid%20email%20profile

https://jwt.io/#code=pz7eKJ8nuKPi8OPfuvqmvNeUAZIBW0gzSlLkBT1-Xez&id_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleXN0b3JlLUNIQU5HRS1NRSJ9.eyJzdWIiOiJhdXRoMHw2MDU5YWVkNGFhNzgwMzAwNmEyMGQ4MjQiLCJub25jZSI6ImZvb2JhciIsImF0X2hhc2giOiJ6al9KS0JHeXFMeDVxZ0Y0ZDlOempBIiwiY19oYXNoIjoicl8zeXNzVmJpelBOQmp5bXlqSEQ4dyIsImF1ZCI6IjI4NDNmYWNhLTg5MTEtNDVhYy1iNjA1LWYxNWM1NTU2Yjg4ZSIsImV4cCI6MTYyNTc2Mzk3MywiaWF0IjoxNjI1NzYwMzczLCJpc3MiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLmNvbS9vaWRjL2lzc3VlcnMvMGFjNmQyOTItMTg2OC00NGQzLWExNjEtOTIzMDUyZTExZmI4In0.FXrUUV9dNjl9BYho9mlJFD2pHNpV5yEhwzh5liHr96vdehAZzWxQIrX8Y8UScAwFytqL_mz2ZZJ5TPYa54kldrl_Sg1_PdGYiG3l42Z6E_Upuk8bs7PHyiloSZ2PC32Qc_X6HHTJBRx0FbnrYJ8RIKbWUcUsSwuqoskD_8oIkEha8AeqkEEBAZDkhgYeoPDMYXpsetCpQFpzxsiHloftAUvhdjwwtmH3t8ImLaiFY18xVlYOpT9w5Q3bcglwKE8hJ3EGCcPvlrvMg-60lBB7yL__JoL2Bo3m6mzZZhBvT813xCL91Ts09qNwHfvR_6X3IvPW5XfDy_qOM96xH2FjGQ&access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCIsImtpZCI6ImtleXN0b3JlLUNIQU5HRS1NRSJ9.eyJ1cm46b2lkYy1wcm92aWRlcjpleGFtcGxlOmZvbyI6ImJhciIsImp0aSI6IlZfc0hmN0xITGpWV2owRFkxb1NIayIsInN1YiI6ImF1dGgwfDYwNTlhZWQ0YWE3ODAzMDA2YTIwZDgyNCIsImlhdCI6MTYyNTc2MDM3MywiZXhwIjoxNjI1NzY3NTczLCJzY29wZSI6IiIsImNsaWVudF9pZCI6IjI4NDNmYWNhLTg5MTEtNDVhYy1iNjA1LWYxNWM1NTU2Yjg4ZSIsImlzcyI6Imh0dHBzOi8vaXNzdWVyLmV4YW1wbGUuY29tL29pZGMvaXNzdWVycy8wYWM2ZDI5Mi0xODY4LTQ0ZDMtYTE2MS05MjMwNTJlMTFmYjgiLCJhdWQiOiJyZXNvdXJjZS1zZXJ2ZXItYXVkaWVuY2UtdmFsdWUifQ.qJKGIAQmK_PgW_Mj9T-bJPc6tXBLYYPEXAeJ19k9qt9iQpgLwuQgn89FHoE50dbQ_zD2Ri6CzPZ-eNCVl1Is3VLK8eplJ78KO3VdSAOPO83vmoLTpfoVfQFO8vTxoGu3SqlUWwL69pneuKx3kAaYeumKjaVjawBxVJAXhYRJG6fwyZM1Ti-Xb_PfqlEJEXPeUmuMIMt_df1hVo6bWcgSlebO3hKHOM1UT8C8_3qkT0nE7jtmd0T72P8ngobZNfZLY65OZhIzJU8IiE4z2Hrfb5AEavPH9MX9iMnOnCz8lBm_jYGM7Gy9mVnvWDeozHSPt_I1iIMEdoc8Fp4U8Ttwag&expires_in=7200&token_type=Bearer&scope=

{
"urn:oidc-provider:example:foo": "bar",
"jti": "V_sHf7LHLjVWj0DY1oSHk",
"sub": "auth0|6059aed4aa7803006a20d824",
"iat": 1625760373,
"exp": 1625767573,
"scope": "",
"client_id": "2843faca-8911-45ac-b605-f15c5556b88e",
"iss": "https://issuer.example.com/oidc/issuers/0ac6d292-1868-44d3-a161-923052e11fb8",
"aud": "resource-server-audience-value"
}

https://jwt.io/#code=D_XS2JDMRgtBaz3KY6mJlwY6a9Jk2LOLUUnaCxa6GqD&id_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleXN0b3JlLUNIQU5HRS1NRSJ9.eyJzdWIiOiJhdXRoMHw2MDU5YWVkNGFhNzgwMzAwNmEyMGQ4MjQiLCJub25jZSI6ImZvb2JhciIsImF0X2hhc2giOiJUbVF4ektJU21WSmVmOERfMnhSWWZRIiwiY19oYXNoIjoiNHltVmkxRGRRWXhLcmpncWdGZG1IQSIsImF1ZCI6IjI4NDNmYWNhLTg5MTEtNDVhYy1iNjA1LWYxNWM1NTU2Yjg4ZSIsImV4cCI6MTYyNTc2NTE4MywiaWF0IjoxNjI1NzYxNTgzLCJpc3MiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLmNvbS9vaWRjL2lzc3VlcnMvMGFjNmQyOTItMTg2OC00NGQzLWExNjEtOTIzMDUyZTExZmI4In0.br39zb-ZRbCBUHAzt7JXvMJJGxOQYWwUUm42ZkE0r907bSLMQeyJCZi9Ikv4ajAy_JPo10_8FHLRscVrWkhFzmFkYKfg8EUEjPWxOSZZMtALsvFZqPtfsebktN_D9ylr99mhF_ZSWHUoYCPzeb6DyiZzxFBvEXoPnXeYfdw7XUzCNpC_f1NeWYvJcJ1LpC4U0lw7sgK0a7evoO52jqUIBzK6QaDm7eXIPwvPpCQkKy3872LyiCr-m5tzUgHwSYka92PeJcxTF-uR5qCYXEYO_BAq6jDUH1ViTaZ5D9VqCgTm4vihxOlgXcfe_y0QBgS6VdxX7mTksz_aWowUGkgKtQ&
access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCIsImtpZCI6ImtleXN0b3JlLUNIQU5HRS1NRSJ9.eyJ1cm46b2lkYy1wcm92aWRlcjpleGFtcGxlOmZvbyI6ImJhciIsImp0aSI6IllkNVU5VGtxT0FPcktiLTF0dWtLcyIsInN1YiI6ImF1dGgwfDYwNTlhZWQ0YWE3ODAzMDA2YTIwZDgyNCIsImlhdCI6MTYyNTc2MTU4MywiZXhwIjoxNjI1NzY4NzgzLCJzY29wZSI6Im9wZW5pZCBlbWFpbCIsImNsaWVudF9pZCI6IjI4NDNmYWNhLTg5MTEtNDVhYy1iNjA1LWYxNWM1NTU2Yjg4ZSIsImlzcyI6Imh0dHBzOi8vaXNzdWVyLmV4YW1wbGUuY29tL29pZGMvaXNzdWVycy8wYWM2ZDI5Mi0xODY4LTQ0ZDMtYTE2MS05MjMwNTJlMTFmYjgiLCJhdWQiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLmNvbSJ9.tbvyISh8TUukjobiLZ-8HysN6YmkNYzKczoHerhDkMswr00ISgNr4ZdWMEzeLn5FRlg9xZwV6p4XFUdKnibGGI0RV5VCNFWA_BXzUdgIAZhlTRhMZ6YaOkbq0dgV2xe30tQ4e1WNk-63akjdTnnjLm70cx6ImuNFNmq78vGESNiwmkxjT65l4gOlcZQyF-s8h1tvt3UYWMJxN1A7YKgwEAvJnxxn5blbTbB6JhNOZuBwfE12j3Fsq7tPKKevaHO5TbZisUlthtoSuzkKkmXeH5WO-AoOIq9anqKzgRFknEoG4PfYFiFfhf7t8vP51RIR31JG2BLzvd_uqM249rE0Fg
&expires_in=7200&token_type=Bearer&scope=openid%20email

idtoken
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

accesstoken
{
"urn:oidc-provider:example:foo": "bar", <=== ADD by ProviderConfiguration extra token claim
"jti": "Yd5U9TkqOAOrKb-1tukKs",
"sub": "auth0|6059aed4aa7803006a20d824", ==== OK
"iat": 1625761583,
"exp": 1625768783,
"scope": "openid email", <==== ADD by resourceindicator
"client_id": "2843faca-8911-45ac-b605-f15c5556b88e",
"iss": "https://issuer.example.com/oidc/issuers/0ac6d292-1868-44d3-a161-923052e11fb8",
"aud": "https://issuer.example.com"        <===== WRONG
}

should we use resource === did ???
what is the relationship between issuer and DID?

https://darutk.medium.com/illustrated-device-flow-rfc-8628-d23d6d311acc
https://darutk.medium.com/ciba-a-new-authentication-authorization-technology-in-2019-explained-by-an-implementer-d1e0ac1311b4
https://github.com/panva/node-oidc-provider/blob/main/example/my_adapter.js
https://github.com/panva/node-openid-client/tree/main/docs
https://learn.mattr.global/api-reference/v1.0.1#tag/OIDC-Verifier-Client
https://github.com/mattrglobal/sample-apps/blob/main/oidc-client-react/package.json
https://github.com/wso2/product-is/issues/6835

### THE GOAL
https://github.com/bcgov/vc-authn-oidc/tree/master/docs
