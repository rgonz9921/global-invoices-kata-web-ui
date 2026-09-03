import { decodeJwtPayload } from './jwt';

const encode = (value: unknown): string =>
  btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

describe('decodeJwtPayload', () => {
  it('decodes the payload of a well-formed token', () => {
    const token = `${encode({ alg: 'HS384' })}.${encode({ sub: 'a@b.com', role: 'OPERADOR' })}.signature`;
    expect(decodeJwtPayload(token)).toEqual({ sub: 'a@b.com', role: 'OPERADOR' });
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwtPayload('not-a-token')).toBeNull();
    expect(decodeJwtPayload('only.two')).toBeNull();
    expect(decodeJwtPayload('a.@@@.c')).toBeNull();
  });
});
