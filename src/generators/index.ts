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
// Batch imports — 300 generators across 14 themed files
import { speedrunGenerator, retroachievementsGenerator, boardgamegeekGenerator, itchioGenerator, rawgGenerator, osuGenerator, minecraftGenerator, robloxGenerator, leagueoflegendsGenerator, valorantGenerator, fortniteGenerator, apexGenerator, overwatchGenerator, csgoGenerator, pokemongoGenerator, moxfieldGenerator, dndbeyondGenerator, bgaGenerator, nexusmodsGenerator } from "./batch-gaming.js";
import { soundcloudGenerator, bandcampGenerator, discogsGenerator, geniusGenerator, mixcloudGenerator, listenbrainzGenerator, setlistfmGenerator, spliceGenerator, beatstarsGenerator, distrokidGenerator, audiusGenerator, songkickGenerator, musixmatchGenerator, soundtrapGenerator, rateYourMusicGenerator, kompozGenerator, chordsGenerator, spotifyArtistGenerator } from "./batch-music.js";
import { deviantartGenerator, artstationGenerator, pixivGenerator, behanceGenerator, flickrGenerator, px500Generator, sketchfabGenerator, society6Generator, redbubbleGenerator, codepenGenerator, observablehqGenerator, glitchGenerator, codesandboxGenerator, replitGenerator, figmaGenerator, canvaGenerator, processingGenerator, shadertoyGenerator, threeJsGenerator } from "./batch-creative.js";
import { stravaGenerator, garminGenerator, myfitnesspalGenerator, pelotonGenerator, runkeeperGenerator, habiticaGenerator, alltrailsGenerator, parkrunGenerator, zwiftGenerator, komootGenerator, fitocracyGenerator, corosGenerator, espnFantasyGenerator, transfermarktGenerator, sofascoreGenerator, f1Generator, cricketGenerator, marathonGenerator, yogaGenerator } from "./batch-fitness.js";
import { untappdGenerator, vivinoGenerator, yelpGenerator, happycowGenerator, allrecipesGenerator, cookpadGenerator, tripadvisorGenerator, nomadlistGenerator, foursquareGenerator, geocachingGenerator, polarstepsGenerator, wikilockGenerator, atlasObscuraGenerator, roameGenerator, couchsurfingGenerator, beeradvocateGenerator, coffeeGenerator, whiskybaseGenerator } from "./batch-food-travel.js";
import { duolingoGenerator, courseraGenerator, edxGenerator, udemyGenerator, skillshareGenerator, codecademyGenerator, freecodecampGenerator, khanGenerator, brilliantGenerator, pluralsightGenerator, memriseGenerator, ankiwebGenerator, italkiGenerator, lingqGenerator, treehouseGenerator, researchgateGenerator, zenodoGenerator, arxivGenerator, googleScholarGenerator } from "./batch-learning.js";
import { tmdbGenerator, traktGenerator, simklGenerator, tvtimeGenerator, myDramaListGenerator, mubiGenerator, storygraphGenerator, librarythingGenerator, bookwyrmGenerator, mangadexGenerator, novelupdatesGenerator, podchaserGenerator, goodpodsGenerator, pocketcastsGenerator, anchorGenerator, podbeanGenerator, wattpadGenerator, royalroadGenerator, ao3Generator } from "./batch-entertainment.js";
import { tumblrGenerator, pinterestGenerator, tiktokGenerator, instagramGenerator, twitterGenerator, lemmy_Generator, lobstersGenerator, tildesGenerator, discordGenerator, telegramGenerator, signalGenerator, matrixGenerator, linkedinGenerator2, facebookGenerator, snapchatGenerator, whatsappGenerator, wechatGenerator, lineGenerator, vkGenerator } from "./batch-social.js";
import { thingiverseGenerator, printablesGenerator, instructablesGenerator, hackadayGenerator, hacksterGenerator, tindieGenerator, adafruitGenerator, arduinoGenerator, inaturalistGenerator, ebirdGenerator, plantnetGenerator, zooniverseGenerator, gbifGenerator, gardeningGenerator, observationOrgGenerator, raspberrypiGenerator, homeassistantGenerator, oshwaGenerator, mycologyGenerator } from "./batch-maker.js";
import { etherscanGenerator, ensGenerator, openseaGenerator, mirrorGenerator, farcasterGenerator, lensGenerator, gitcoinGenerator, debankGenerator, zoraGenerator, tradingviewGenerator, stocktwitsGenerator, seekingalphaGenerator, kofiGenerator, patreonGenerator, gumroadGenerator, lemonSqueezyGenerator, indieHackersGenerator, microacquireGenerator, pioneerGenerator } from "./batch-finance-crypto.js";
import { codeforcesGenerator, atcoderGenerator, topcoderGenerator, projecteulerGenerator, codingameGenerator, dmojGenerator, kattisGenerator, rubygems_Generator, packagistGenerator, nugetGenerator, hexpmGenerator, pubdevGenerator, cocoapodsGenerator, mavenGenerator, sourcehutGenerator, wandbGenerator, dagshubGenerator, giteaGenerator, forgejogGenerator } from "./batch-code-extra.js";
import { vimeoGenerator, dailymotionGenerator, peertubeGenerator, odyseeGenerator, kickGenerator, bilibiliGenerator, rumbleGenerator, nebulaGenerator, floatplaneGenerator, streamlabsGenerator, loomGenerator, substackVideoGenerator, youtubeShorts, reelsGenerator, clipchampGenerator, davinciResolve, adobePortfolioGenerator, cargocollectiveGenerator, readcvGenerator } from "./batch-video-streaming.js";
import { notionGenerator, obsidianPublishGenerator, raindropGenerator, arenaGenerator, pinboardGenerator, todoistGenerator, linearGenerator, grailedGenerator, depopGenerator, vintedGenerator, etsyGenerator, shopiifyGenerator, producthuntMaker, typefullyGenerator, convertKitGenerator, buttondownGenerator, revueGenerator, polyworkGenerator, bioLinkGenerator } from "./batch-productivity.js";
import { zodiacGenerator, mbtiGenerator, enneagramGenerator, hogwartsGenerator, alignmentGenerator, colorPaletteGenerator, timezoneGenerator, languagesSpokenGenerator, dietGenerator, sleepGenerator, coffeeTeaGenerator, ideGenerator, osGenerator, keyboardGenerator, deskSetupGenerator, dotfilesGenerator, nowPageGenerator, usesPageGenerator, personalSiteGenerator, pronounsGenerator } from "./batch-weird.js";
import { wazeGenerator, openstreetmapGenerator, wikipediaGenerator, stackExchangeGenerator, meetupGenerator, eventbriteGenerator, lumaGenerator, speakerdeckGenerator, slideshareGenerator, calendlyGenerator, calGenerator, giphy_Generator, gravatar2Generator, aboutMeGenerator, humansTxtGenerator, webringGenerator, indiewebGenerator, mastodonVerifyGenerator, matrixVerifyGenerator } from "./batch-misc.js";
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
  // --- 300 Batch Generators ---
  // Gaming (19)
  speedrunGenerator, retroachievementsGenerator, boardgamegeekGenerator, itchioGenerator, rawgGenerator, osuGenerator, minecraftGenerator, robloxGenerator, leagueoflegendsGenerator, valorantGenerator, fortniteGenerator, apexGenerator, overwatchGenerator, csgoGenerator, pokemongoGenerator, moxfieldGenerator, dndbeyondGenerator, bgaGenerator, nexusmodsGenerator,
  // Music (18)
  soundcloudGenerator, bandcampGenerator, discogsGenerator, geniusGenerator, mixcloudGenerator, listenbrainzGenerator, setlistfmGenerator, spliceGenerator, beatstarsGenerator, distrokidGenerator, audiusGenerator, songkickGenerator, musixmatchGenerator, soundtrapGenerator, rateYourMusicGenerator, kompozGenerator, chordsGenerator, spotifyArtistGenerator,
  // Creative & Art (19)
  deviantartGenerator, artstationGenerator, pixivGenerator, behanceGenerator, flickrGenerator, px500Generator, sketchfabGenerator, society6Generator, redbubbleGenerator, codepenGenerator, observablehqGenerator, glitchGenerator, codesandboxGenerator, replitGenerator, figmaGenerator, canvaGenerator, processingGenerator, shadertoyGenerator, threeJsGenerator,
  // Fitness & Sports (19)
  stravaGenerator, garminGenerator, myfitnesspalGenerator, pelotonGenerator, runkeeperGenerator, habiticaGenerator, alltrailsGenerator, parkrunGenerator, zwiftGenerator, komootGenerator, fitocracyGenerator, corosGenerator, espnFantasyGenerator, transfermarktGenerator, sofascoreGenerator, f1Generator, cricketGenerator, marathonGenerator, yogaGenerator,
  // Food & Travel (18)
  untappdGenerator, vivinoGenerator, yelpGenerator, happycowGenerator, allrecipesGenerator, cookpadGenerator, tripadvisorGenerator, nomadlistGenerator, foursquareGenerator, geocachingGenerator, polarstepsGenerator, wikilockGenerator, atlasObscuraGenerator, roameGenerator, couchsurfingGenerator, beeradvocateGenerator, coffeeGenerator, whiskybaseGenerator,
  // Learning & Science (19)
  duolingoGenerator, courseraGenerator, edxGenerator, udemyGenerator, skillshareGenerator, codecademyGenerator, freecodecampGenerator, khanGenerator, brilliantGenerator, pluralsightGenerator, memriseGenerator, ankiwebGenerator, italkiGenerator, lingqGenerator, treehouseGenerator, researchgateGenerator, zenodoGenerator, arxivGenerator, googleScholarGenerator,
  // Entertainment (19)
  tmdbGenerator, traktGenerator, simklGenerator, tvtimeGenerator, myDramaListGenerator, mubiGenerator, storygraphGenerator, librarythingGenerator, bookwyrmGenerator, mangadexGenerator, novelupdatesGenerator, podchaserGenerator, goodpodsGenerator, pocketcastsGenerator, anchorGenerator, podbeanGenerator, wattpadGenerator, royalroadGenerator, ao3Generator,
  // Social (19)
  tumblrGenerator, pinterestGenerator, tiktokGenerator, instagramGenerator, twitterGenerator, lemmy_Generator, lobstersGenerator, tildesGenerator, discordGenerator, telegramGenerator, signalGenerator, matrixGenerator, linkedinGenerator2, facebookGenerator, snapchatGenerator, whatsappGenerator, wechatGenerator, lineGenerator, vkGenerator,
  // Maker & Nature (19)
  thingiverseGenerator, printablesGenerator, instructablesGenerator, hackadayGenerator, hacksterGenerator, tindieGenerator, adafruitGenerator, arduinoGenerator, inaturalistGenerator, ebirdGenerator, plantnetGenerator, zooniverseGenerator, gbifGenerator, gardeningGenerator, observationOrgGenerator, raspberrypiGenerator, homeassistantGenerator, oshwaGenerator, mycologyGenerator,
  // Finance & Crypto (19)
  etherscanGenerator, ensGenerator, openseaGenerator, mirrorGenerator, farcasterGenerator, lensGenerator, gitcoinGenerator, debankGenerator, zoraGenerator, tradingviewGenerator, stocktwitsGenerator, seekingalphaGenerator, kofiGenerator, patreonGenerator, gumroadGenerator, lemonSqueezyGenerator, indieHackersGenerator, microacquireGenerator, pioneerGenerator,
  // Code Extra (19)
  codeforcesGenerator, atcoderGenerator, topcoderGenerator, projecteulerGenerator, codingameGenerator, dmojGenerator, kattisGenerator, rubygems_Generator, packagistGenerator, nugetGenerator, hexpmGenerator, pubdevGenerator, cocoapodsGenerator, mavenGenerator, sourcehutGenerator, wandbGenerator, dagshubGenerator, giteaGenerator, forgejogGenerator,
  // Video & Streaming (19)
  vimeoGenerator, dailymotionGenerator, peertubeGenerator, odyseeGenerator, kickGenerator, bilibiliGenerator, rumbleGenerator, nebulaGenerator, floatplaneGenerator, streamlabsGenerator, loomGenerator, substackVideoGenerator, youtubeShorts, reelsGenerator, clipchampGenerator, davinciResolve, adobePortfolioGenerator, cargocollectiveGenerator, readcvGenerator,
  // Productivity & Lifestyle (19)
  notionGenerator, obsidianPublishGenerator, raindropGenerator, arenaGenerator, pinboardGenerator, todoistGenerator, linearGenerator, grailedGenerator, depopGenerator, vintedGenerator, etsyGenerator, shopiifyGenerator, producthuntMaker, typefullyGenerator, convertKitGenerator, buttondownGenerator, revueGenerator, polyworkGenerator, bioLinkGenerator,
  // Weird & Fun (20)
  zodiacGenerator, mbtiGenerator, enneagramGenerator, hogwartsGenerator, alignmentGenerator, colorPaletteGenerator, timezoneGenerator, languagesSpokenGenerator, dietGenerator, sleepGenerator, coffeeTeaGenerator, ideGenerator, osGenerator, keyboardGenerator, deskSetupGenerator, dotfilesGenerator, nowPageGenerator, usesPageGenerator, personalSiteGenerator, pronounsGenerator,
  // Misc (19)
  wazeGenerator, openstreetmapGenerator, wikipediaGenerator, stackExchangeGenerator, meetupGenerator, eventbriteGenerator, lumaGenerator, speakerdeckGenerator, slideshareGenerator, calendlyGenerator, calGenerator, giphy_Generator, gravatar2Generator, aboutMeGenerator, humansTxtGenerator, webringGenerator, indiewebGenerator, mastodonVerifyGenerator, matrixVerifyGenerator,
];
