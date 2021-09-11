import didJWT from 'did-jwt';
import generators from '../../src/utils/generators';

let code_verifier: string;

describe('issue-credential', () => {
  it('issue credential test', () => {
    const nonce = generators.nonce();
    const state = generators.state();
    code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    console.log('*** code_verifier *** ', code_verifier);

    expect(true).to.equal(true);
  });
});
