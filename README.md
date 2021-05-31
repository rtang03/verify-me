# verify-me

```sequence
title Verifiable credential using Selective Disclosure
participant Valid Time Oracle
participant Janet
participant ID Provider
participant Ledger
participant Bar

note over Janet:Prover
note over Bar:Validator

note over Janet,Bar: Preparation and Setup

note right of ID Provider:Infrastructure
ID Provider->Ledger: Define Schema (Name, Birthdate, Address)
ID Provider->Ledger: credential Definition (Pub Key, etc.)
ID Provider->ID Provider: Generate Prv Key for this credential
ID Provider->Ledger:Revocation Registry

note left of Bar: Prepare to accept credentials
Bar->Bar:Install Agent
Bar->Ledger: Check schema

note over Janet,Bar: Begin Use Case
Janet->ID Provider: Request ID
ID Provider-->Janet: ID will be issued as a digital credential
note right of Janet: Prepare to receive credentials
Janet->Janet: Install Agent
Janet->Janet: Prv Key Generate, Store
Janet->Ledger:Check Schema
Ledger->Janet:credential Definition
Janet-->ID Provider:Proof of Name, Birthdate, Address
Janet->ID Provider: Blinded secret
ID Provider->Janet: credential
Janet->Janet: Validate credential against credential Def

note over Janet,Bar: Janet goes to the bar
note left of Bar: Can Janet Enter?
Bar->Janet: Request Proof of Age
Janet->Valid Time Oracle: Get time
Valid Time Oracle->Janet: Time credential
Janet->Janet:Generate Proof (This person is over 21)
Janet->Bar: Provide Proof
Bar->Bar: Evaluate proof
Bar->Ledger: Verify on Ledger
Ledger->Bar: Verification
Bar->Janet: Come in

note left of Bar: Invite to club

Bar->Janet: Join loyalty club? (requires valid postal code)
Janet->Janet:Generate Proof (postal code)
Janet->Bar: Provide Proof
Bar->Bar: Evaluate proof
Bar->Ledger: Verify on Ledger
Ledger->Bar: Verification
Bar->Janet: Have Loyalty Card
```

sudo lsof -i :5432
