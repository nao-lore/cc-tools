import { md5 } from './md5';

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const WEB_CRYPTO_ALGOS: Record<Exclude<HashAlgorithm, 'MD5'>, string> = {
  'SHA-1': 'SHA-1',
  'SHA-256': 'SHA-256',
  'SHA-384': 'SHA-384',
  'SHA-512': 'SHA-512',
};

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeHash(
  algo: HashAlgorithm,
  data: Uint8Array
): Promise<string> {
  if (algo === 'MD5') {
    return md5(data);
  }
  const digest = await crypto.subtle.digest(WEB_CRYPTO_ALGOS[algo], data as ArrayBufferView<ArrayBuffer>);
  return bufToHex(digest);
}

export interface HashResult {
  algorithm: HashAlgorithm;
  hash: string;
}

const ALL_ALGOS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export async function computeAllHashes(data: Uint8Array): Promise<HashResult[]> {
  const results = await Promise.all(
    ALL_ALGOS.map(async (algo) => ({
      algorithm: algo,
      hash: await computeHash(algo, data),
    }))
  );
  return results;
}
