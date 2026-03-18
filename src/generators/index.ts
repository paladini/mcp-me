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
import { blueskyGenerator } from "./bluesky.js";
import { leetcodeGenerator } from "./leetcode.js";
import { bitbucketGenerator } from "./bitbucket.js";
import { huggingfaceGenerator } from "./huggingface.js";
import { substackGenerator } from "./substack.js";
import { twitchGenerator } from "./twitch.js";
import { kaggleGenerator } from "./kaggle.js";
import { dribbbleGenerator } from "./dribbble.js";
import { producthuntGenerator } from "./producthunt.js";
import { exercismGenerator } from "./exercism.js";
import { hackerrankGenerator } from "./hackerrank.js";
import { wordpressGenerator } from "./wordpress.js";
import { unsplashGenerator } from "./unsplash.js";
import { codebergGenerator } from "./codeberg.js";
import { anilistGenerator } from "./anilist.js";
import { threadsGenerator } from "./threads.js";
import type { GeneratorSource } from "./types.js";

/**
 * All registered generators. The CLI and orchestrator read from this array.
 * To add a new generator: create the file, import it here, add to this array. Done.
 */
export const generators: GeneratorSource[] = [
  // Code
  githubGenerator,
  gitlabGenerator,
  bitbucketGenerator,
  huggingfaceGenerator,
  // Writing
  devtoGenerator,
  mediumGenerator,
  hashnodeGenerator,
  substackGenerator,
  openlibraryGenerator,
  orcidGenerator,
  semanticScholarGenerator,
  youtubeGenerator,
  // Community
  stackoverflowGenerator,
  hackernewsGenerator,
  mastodonGenerator,
  blueskyGenerator,
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
  leetcodeGenerator,
  lastfmGenerator,
  steamGenerator,
  twitchGenerator,
  // Identity
  gravatarGenerator,
  keybaseGenerator,
  // Creative & Design
  dribbbleGenerator,
  unsplashGenerator,
  // Community (additional)
  producthuntGenerator,
  threadsGenerator,
  // Activity (additional)
  exercismGenerator,
  hackerrankGenerator,
  anilistGenerator,
  // Code (additional)
  kaggleGenerator,
  codebergGenerator,
  // Writing (additional)
  wordpressGenerator,
];
