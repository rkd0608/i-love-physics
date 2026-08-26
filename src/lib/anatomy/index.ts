import { orbitsAnatomy } from "./orbits";
import { projectileMotionAnatomy } from "./projectile-motion";
import { waveInterferenceAnatomy } from "./wave-interference";
import { doublePendulumAnatomy } from "./double-pendulum";
import { harmonicOscillatorAnatomy } from "./harmonic-oscillator";
import { specialRelativityAnatomy } from "./special-relativity";
import { twinParadoxAnatomy } from "./twin-paradox";
import { quantumDoubleSlitAnatomy } from "./quantum-double-slit";
import { quantumTunnelingAnatomy } from "./quantum-tunneling";
import { heisenbergUncertaintyAnatomy } from "./heisenberg-uncertainty";
import { fourierSoundAnatomy } from "./fourier-sound";
import { olbersParadoxAnatomy } from "./olbers-paradox";
import { zenoAchillesAnatomy } from "./zeno-achilles";
import { maxwellDemonAnatomy } from "./maxwell-demon";
import { threeBodyAnatomy } from "./three-body";
import { brachistochroneAnatomy } from "./brachistochrone";
import { coupledModesAnatomy } from "./coupled-modes";
import { electricFieldsAnatomy } from "./electric-fields";
import { magneticDipoleAnatomy } from "./magnetic-dipole";
import { electromagneticInductionAnatomy } from "./electromagnetic-induction";
import { lcCircuitAnatomy } from "./lc-circuit";
import { idealGasAnatomy } from "./ideal-gas";
import { carnotCycleAnatomy } from "./carnot-cycle";
import { diffusionRandomWalkAnatomy } from "./diffusion-random-walk";
import { keplerLawsAnatomy } from "./kepler-laws";
import { hohmannTransferAnatomy } from "./hohmann-transfer";
import { cosmologicalRedshiftAnatomy } from "./cosmological-redshift";
import { snellsLawAnatomy } from "./snells-law";
import { thinLensesAnatomy } from "./thin-lenses";
import { dopplerEffectAnatomy } from "./doppler-effect";
import { standingWavesAnatomy } from "./standing-waves";
import { angularMomentumAnatomy } from "./angular-momentum";
import { collisionLabAnatomy } from "./collision-lab";
import { logisticMapAnatomy } from "./logistic-map";

const ENTRY_COUNTS: Record<string, number> = Object.fromEntries([
  ["orbits", 4],
  ["projectile-motion", 4],
  ["wave-interference", 4],
  ["double-pendulum", 3],
  ["harmonic-oscillator", 4],
  ["special-relativity", 3],
  ["twin-paradox", 3],
  ["quantum-double-slit", 3],
  ["quantum-tunneling", 3],
  ["heisenberg-uncertainty", 3],
  ["fourier-sound", 3],
  ["olbers-paradox", 3],
  ["zeno-achilles", 3],
  ["maxwell-demon", 3],
  ["three-body", 3],
  ["brachistochrone", 3],
  ["coupled-modes", 3],
  ["electric-fields", 3],
  ["magnetic-dipole", 3],
  ["electromagnetic-induction", 3],
  ["lc-circuit", 3],
  ["ideal-gas", 3],
  ["carnot-cycle", 3],
  ["diffusion-random-walk", 3],
  ["kepler-laws", 3],
  ["hohmann-transfer", 3],
  ["cosmological-redshift", 3],
  ["snells-law", 3],
  ["thin-lenses", 3],
  ["doppler-effect", 3],
  ["standing-waves", 3],
  ["angular-momentum", 3],
  ["collision-lab", 3],
  ["logistic-map", 3],
]);

function normalize(slug: string, topicAnatomy: Record<number, import("./types").AnatomyPart[]>): Record<number, import("./types").AnatomyPart[]> {
  const count = ENTRY_COUNTS[slug] ?? Number.MAX_SAFE_INTEGER;
  const keys = Object.keys(topicAnatomy).map(Number);
  const isGlobal = keys.some((k) => k >= count);
  if (!isGlobal) return topicAnatomy;
  const offset = keys.reduce((acc,k)=>Math.min(acc,k), Number.MAX_SAFE_INTEGER);
  const out: Record<number, import("./types").AnatomyPart[]> = {};
  for (const [k,v] of Object.entries(topicAnatomy)) out[Number(k)-offset] = v;
  return out;
}

export const ANATOMY: Record<string, Record<number, import("./types").AnatomyPart[]>> = {
  "orbits": orbitsAnatomy,
  "projectile-motion": projectileMotionAnatomy,
  "wave-interference": waveInterferenceAnatomy,
  "double-pendulum": doublePendulumAnatomy,
  "harmonic-oscillator": harmonicOscillatorAnatomy,
  "special-relativity": specialRelativityAnatomy,
  "twin-paradox": twinParadoxAnatomy,
  "quantum-double-slit": quantumDoubleSlitAnatomy,
  "quantum-tunneling": quantumTunnelingAnatomy,
  "heisenberg-uncertainty": heisenbergUncertaintyAnatomy,
  "fourier-sound": fourierSoundAnatomy,
  "olbers-paradox": olbersParadoxAnatomy,
  "zeno-achilles": zenoAchillesAnatomy,
  "maxwell-demon": maxwellDemonAnatomy,
  "three-body": threeBodyAnatomy,
  "brachistochrone": brachistochroneAnatomy,
  "coupled-modes": coupledModesAnatomy,
  "electric-fields": electricFieldsAnatomy,
  "magnetic-dipole": magneticDipoleAnatomy,
  "electromagnetic-induction": electromagneticInductionAnatomy,
  "lc-circuit": lcCircuitAnatomy,
  "ideal-gas": idealGasAnatomy,
  "carnot-cycle": carnotCycleAnatomy,
  "diffusion-random-walk": diffusionRandomWalkAnatomy,
  "kepler-laws": keplerLawsAnatomy,
  "hohmann-transfer": hohmannTransferAnatomy,
  "cosmological-redshift": cosmologicalRedshiftAnatomy,
  "snells-law": snellsLawAnatomy,
  "thin-lenses": thinLensesAnatomy,
  "doppler-effect": dopplerEffectAnatomy,
  "standing-waves": standingWavesAnatomy,
  "angular-momentum": angularMomentumAnatomy,
  "collision-lab": collisionLabAnatomy,
  "logistic-map": logisticMapAnatomy,
};

for (const slug of Object.keys(ANATOMY)) ANATOMY[slug] = normalize(slug, ANATOMY[slug]);
