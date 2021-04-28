import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { addressToDid } from '../utils';

export class VerificationMethod {
  @Column()
  id: string;

  @Column()
  type: string;

  @Column()
  controller: string;

  @Column()
  publicKeyHex: string;

  constructor(id: string, controller: string, publicKeyHex: string) {
    this.id = id;
    this.type = 'Secp256k1VerificationKey2018';
    this.controller = controller;
    this.publicKeyHex = publicKeyHex;
  }
}

@Entity()
export class DidDocument {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  id: string;

  @Column()
  description: string;

  @Column()
  controller: string;

  @Column()
  created: string;

  @Column()
  updated: string;

  @Column(() => VerificationMethod)
  verificationMethod: VerificationMethod[];

  constructor();
  constructor(option: { id: string; controllerKey: string; description: string });
  constructor(option?: { id: string; controllerKey: string; description: string }) {
    if (option) {
      this['@context'] = 'https://www.w3.org/ns/did/v1';
      this.description = option?.description;
      this.id = option?.id;
      // here assumes the subject is controller
      this.controller = option?.id;
      const timestamp = Date.now();
      const isoTime = new Date(timestamp).toISOString();
      this.created = isoTime;
      this.updated = isoTime;
    }
  }
}
