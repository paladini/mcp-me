export type {
  PartialProfile,
  GeneratorSource,
  GenerateOptions,
  GenerateResult,
} from "./types.js";

export { mergeProfiles } from "./merger.js";

// --- Generator Registry ---
// To add a new generator, just import and add it to this array.
// The orchestrator and CLI read from this automatically.

import { githubGenerator } from "./github.js";
import { stackoverflowGenerator } from "./stackoverflow.js";
import { devtoGenerator } from "./devto.js";
import { npmGenerator, pypiGenerator } from "./npm.js";
import { mediumGenerator } from "./medium.js";
import { wakatimeGenerator } from "./wakatime.js";
import { mastodonGenerator } from "./mastodon.js";
import { letterboxdGenerator } from "./letterboxd.js";
import { hackernewsGenerator } from "./hackernews.js";
import { gitlabGenerator } from "./gitlab.js";
import { gravatarGenerator } from "./gravatar.js";
import { redditGenerator } from "./reddit.js";
import { keybaseGenerator } from "./keybase.js";
import type { GeneratorSource } from "./types.js";

/**
 * All registered generators. The CLI and orchestrator read from this array.
 * To add a new generator: create the file, import it here, add to this array. Done.
 */
export const generators: GeneratorSource[] = [
  githubGenerator,
  gitlabGenerator,
  stackoverflowGenerator,
  devtoGenerator,
  mediumGenerator,
  hackernewsGenerator,
  mastodonGenerator,
  redditGenerator,
  npmGenerator,
  pypiGenerator,
  wakatimeGenerator,
  letterboxdGenerator,
  gravatarGenerator,
  keybaseGenerator,
];
