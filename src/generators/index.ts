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
import { openlibraryGenerator } from "./openlibrary.js";
import { goodreadsGenerator } from "./goodreads.js";
import { orcidGenerator } from "./orcid.js";
import { semanticScholarGenerator } from "./semanticscholar.js";
import { chesscomGenerator } from "./chess.js";
import { lichessGenerator } from "./lichess.js";
import { codewarsGenerator } from "./codewars.js";
import { dockerhubGenerator } from "./dockerhub.js";
import { cratesioGenerator } from "./cratesio.js";
import { lastfmGenerator } from "./lastfm.js";
import { youtubeGenerator } from "./youtube.js";
import { hashnodeGenerator } from "./hashnode.js";
import { steamGenerator } from "./steam.js";
import type { GeneratorSource } from "./types.js";

/**
 * All registered generators. The CLI and orchestrator read from this array.
 * To add a new generator: create the file, import it here, add to this array. Done.
 */
export const generators: GeneratorSource[] = [
  // Code
  githubGenerator,
  gitlabGenerator,
  // Writing
  devtoGenerator,
  mediumGenerator,
  hashnodeGenerator,
  openlibraryGenerator,
  orcidGenerator,
  semanticScholarGenerator,
  // Community
  stackoverflowGenerator,
  hackernewsGenerator,
  mastodonGenerator,
  redditGenerator,
  // Packages
  npmGenerator,
  pypiGenerator,
  cratesioGenerator,
  dockerhubGenerator,
  // Activity
  wakatimeGenerator,
  letterboxdGenerator,
  goodreadsGenerator,
  chesscomGenerator,
  lichessGenerator,
  codewarsGenerator,
  lastfmGenerator,
  steamGenerator,
  youtubeGenerator,
  // Identity
  gravatarGenerator,
  keybaseGenerator,
];
