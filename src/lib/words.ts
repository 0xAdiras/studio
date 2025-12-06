const WORDS = [
  'apple', 'orbit', 'echo', 'river', 'mountain', 'ocean', 'desert', 'forest', 'meadow',
  'galaxy', 'star', 'planet', 'comet', 'nebula', 'cosmos', 'lunar', 'solar', 'nova',
  'breeze', 'storm', 'cloud', 'frost', 'ember', 'flame', 'spark', 'stone', 'crystal',
  'cipher', 'vector', 'matrix', 'pixel', 'quark', 'axiom', 'helix', 'tensor', 'node',
  'anchor', 'beacon', 'harbor', 'haven', 'jetty', 'marina', 'port', 'quay', 'wharf',
  'bridge', 'tunnel', 'viaduct', 'aqueduct', 'canal', 'causeway', 'dam', 'lock', 'weir',
  'chisel', 'gouge', 'mallet', 'plane', 'rasp', 'saw', 'adze', 'awl', 'lathe',
  'violin', 'cello', 'piano', 'flute', 'oboe', 'harp', 'lyre', 'guitar', 'drum',
  'scarlet', 'indigo', 'amber', 'ivory', 'jade', 'coral', 'azure', 'mauve', 'ochre'
];

export function generateWords(): string {
  const selectedWords: string[] = [];
  while (selectedWords.length < 3) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (!selectedWords.includes(word)) {
      selectedWords.push(word);
    }
  }
  return selectedWords.join('-');
}

export function validateWords(input: string): boolean {
  const parts = input.split('-');
  return parts.length === 3 && parts.every(part => /^[a-z]+$/.test(part));
}
