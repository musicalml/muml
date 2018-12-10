const subContraKeys = ['A0', 'A#0', 'B0', 'FakeB#0'];
const fiveLinedKeys = ['C9'];
const octaveKeys = ['C', 'C#', 'D', 'D#', 'E', 'FakeE#', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B', 'FakeB#'];
const fullOctaveKeys = [].concat(...[1, 2, 3, 4, 5, 6, 7].map((octave)=>(
  octaveKeys.map((note)=>(note+octave)))));

const keysWithFakes = [
  ...subContraKeys,
  ...fullOctaveKeys,
  ...fiveLinedKeys,
];

const keysWithoutFakes = keysWithFakes.filter((key)=>(!key.includes('Fake')));

const midiCodeToKey = (midiCode) => (midiCode >= 21
  ? keysWithoutFakes[midiCode - 21]
  : null);

const keyToMidiCode = (key) => (keysWithoutFakes.indexOf(key) + 21);

export {
  keysWithFakes,
  keysWithoutFakes,
  midiCodeToKey,
  keyToMidiCode,
};
