// import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
//
// export class Issuer {
//   @Column()
//   id: string;
//
//   @Column()
//   name: string;
// }
//
// export class CredentialStatus {
//   @Column()
//   id?: string;
//
//   @Column()
//   type?: string;
//
//   @Column()
//   revocationListCredential?: string;
//
//   @Column()
//   revocationListIndex?: number;
// }
//
// export class Proof {
//   @Column()
//   type: string;
//
//   @Column()
//   created: string;
//
//   @Column()
//   jws: string;
//
//   @Column()
//   proofPurpose: string;
//
//   @Column()
//   verificationMethod: string;
// }
//
// export class Credential {
//   @Column()
//   '@context': string[];
//
//   @Column()
//   type: string[];
//
//   @Column()
//   issuer?: Issuer | string;
//
//   @Column()
//   issuanceDate: string;
//
//   @Column()
//   credentialStatus?: CredentialStatus;
//
//   @Column()
//   credentialSubject: any;
//
//   @Column()
//   proof: Proof;
// }
//
// @Entity()
// export class Credentials {
//   @ObjectIdColumn()
//   id: ObjectID;
//
//   @Column()
//   credential: Credential;
//
//   @Column()
//   tag?: string;
//
//   @Column()
//   credentialStatus?: CredentialStatus;
//
//   @Column()
//   issuanceDate: string;
// }
