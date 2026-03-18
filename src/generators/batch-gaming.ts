/**
 * Gaming & Esports Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const speedrunGenerator = createGenerator({
  name: "speedrun", flag: "speedrun", description: "Speedrun.com profile, PBs, world records",
  category: "gaming", platform: "speedrun", profileUrl: "https://www.speedrun.com/users/{input}",
  apiUrl: "https://www.speedrun.com/api/v1/users/{input}/personal-bests",
  extract: (data: unknown) => {
    const d = data as { data?: { place: number; run: { game: string } }[] };
    const pbs = d.data ?? [];
    return { stats: `I have ${pbs.length} personal bests on Speedrun.com.`, topics: ["speedrunning", "gaming"], hobbies: ["speedrunning"] };
  },
});

export const retroachievementsGenerator = createGenerator({
  name: "retroachievements", flag: "retroachievements", description: "RetroAchievements retro gaming profile",
  category: "gaming", platform: "retroachievements", profileUrl: "https://retroachievements.org/user/{input}",
  apiUrl: "https://retroachievements.org/API/API_GetUserSummary.php?u={input}&z=mcp-me&y=unused",
  extract: (data: unknown) => {
    const d = data as { TotalPoints?: number; TotalTruePoints?: number; MemberSince?: string };
    return { stats: `I'm on RetroAchievements with ${d.TotalPoints ?? 0} points.`, hobbies: ["retro gaming"], topics: ["retro games", "emulation"] };
  },
});

export const boardgamegeekGenerator = createGenerator({
  name: "boardgamegeek", flag: "bgg", flagArg: "<username>", description: "BoardGameGeek collection, ratings",
  category: "gaming", platform: "boardgamegeek", profileUrl: "https://boardgamegeek.com/user/{input}",
  apiUrl: "https://boardgamegeek.com/xmlapi2/collection?username={input}&stats=1&subtype=boardgame",
  apiHeaders: { Accept: "application/xml" },
  extract: (_data: unknown, _input) => {
    return { hobbies: ["board games", "tabletop games"], topics: ["board games", "strategy games"] };
  },
});

export const itchioGenerator = createGenerator({
  name: "itchio", flag: "itchio", description: "itch.io indie games published/played",
  category: "gaming", platform: "itch.io", profileUrl: "https://{input}.itch.io",
  apiUrl: "https://itch.io/api/1/key/my-games",
  extract: (data: unknown) => {
    const d = data as { games?: { title: string; url: string; short_text: string }[] };
    const games = d.games ?? [];
    return {
      stats: `I have ${games.length} games on itch.io.`,
      projects: games.slice(0, 10).map(g => ({ name: g.title, description: g.short_text, url: g.url })),
      topics: ["indie games", "game development"],
    };
  },
});

export const rawgGenerator = createGenerator({
  name: "rawg", flag: "rawg", flagArg: "<user-slug>", description: "RAWG.io gaming profile, library",
  category: "gaming", platform: "rawg", profileUrl: "https://rawg.io/@{input}",
  apiUrl: "https://api.rawg.io/api/users/{input}?key=mcp-me",
  extract: (data: unknown) => {
    const d = data as { username?: string; bio?: string; games_count?: number };
    return { displayName: d.username, bio: d.bio, stats: `I have ${d.games_count ?? 0} games in my RAWG library.`, hobbies: ["gaming"] };
  },
});

export const osuGenerator = createGenerator({
  name: "osu", flag: "osu", description: "osu! rhythm game profile, rank, play count",
  category: "gaming", platform: "osu", profileUrl: "https://osu.ppy.sh/users/{input}",
  apiUrl: "https://osu.ppy.sh/api/v2/users/{input}",
  extract: (data: unknown) => {
    const d = data as { username?: string; statistics?: { global_rank?: number; play_count?: number; pp?: number } };
    const s = d.statistics;
    return { displayName: d.username, stats: `I'm ranked #${s?.global_rank ?? "?"} globally on osu! with ${s?.play_count ?? 0} plays and ${Math.round(s?.pp ?? 0)}pp.`, hobbies: ["rhythm games"], topics: ["osu", "rhythm games"] };
  },
});

export const minecraftGenerator = createGenerator({
  name: "minecraft", flag: "minecraft", flagArg: "<uuid>", description: "Minecraft profile, skin, username history",
  category: "gaming", platform: "minecraft", profileUrl: "https://namemc.com/profile/{input}",
  apiUrl: "https://sessionserver.mojang.com/session/minecraft/profile/{input}",
  extract: (data: unknown) => {
    const d = data as { name?: string };
    return { displayName: d.name, stats: `I'm ${d.name} on Minecraft.`, hobbies: ["minecraft"], topics: ["minecraft", "sandbox games"] };
  },
});

export const robloxGenerator = createGenerator({
  name: "roblox", flag: "roblox", flagArg: "<userId>", description: "Roblox profile, friends, badges",
  category: "gaming", platform: "roblox", profileUrl: "https://www.roblox.com/users/{input}/profile",
  apiUrl: "https://users.roblox.com/v1/users/{input}",
  extract: (data: unknown) => {
    const d = data as { name?: string; displayName?: string; description?: string };
    return { displayName: d.displayName ?? d.name, bio: d.description, hobbies: ["roblox", "gaming"], topics: ["roblox", "game creation"] };
  },
});

export const leagueoflegendsGenerator = createStaticGenerator({
  name: "lol", flag: "lol", flagArg: "<summoner#tag>", description: "League of Legends summoner profile",
  category: "gaming", platform: "league-of-legends", profileUrl: (i) => `https://www.op.gg/summoners/na/${i}`,
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "league-of-legends", url: `https://www.op.gg/summoners/na/${input}`, username: input }] } },
    faq: [{ question: "Do you play League of Legends?", answer: `Yes, my summoner is ${input}.`, category: "gaming" }],
    interests: { hobbies: ["league of legends", "moba"], topics: ["esports", "competitive gaming"] },
  }),
});

export const valorantGenerator = createStaticGenerator({
  name: "valorant", flag: "valorant", flagArg: "<name#tag>", description: "Valorant player profile",
  category: "gaming", platform: "valorant", profileUrl: (i) => `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(i)}`,
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "valorant", url: `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(input)}`, username: input }] } },
    faq: [{ question: "Do you play Valorant?", answer: `Yes, I play Valorant as ${input}.`, category: "gaming" }],
    interests: { hobbies: ["valorant", "fps"], topics: ["fps games", "esports"] },
  }),
});

export const fortniteGenerator = createStaticGenerator({
  name: "fortnite", flag: "fortnite", description: "Fortnite player stats",
  category: "gaming", platform: "fortnite", profileUrl: (i) => `https://fortnitetracker.com/profile/all/${i}`,
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "fortnite", url: `https://fortnitetracker.com/profile/all/${input}`, username: input }] } },
    faq: [{ question: "Do you play Fortnite?", answer: `Yes, I play Fortnite as ${input}.`, category: "gaming" }],
    interests: { hobbies: ["fortnite", "battle royale"], topics: ["battle royale", "gaming"] },
  }),
});

export const apexGenerator = createStaticGenerator({
  name: "apex", flag: "apex", description: "Apex Legends player profile",
  category: "gaming", platform: "apex-legends", profileUrl: (i) => `https://apex.tracker.gg/apex/profile/origin/${i}`,
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "apex-legends", url: `https://apex.tracker.gg/apex/profile/origin/${input}`, username: input }] } },
    faq: [{ question: "Do you play Apex Legends?", answer: `Yes, I play Apex Legends as ${input}.`, category: "gaming" }],
    interests: { hobbies: ["apex legends"], topics: ["battle royale", "fps"] },
  }),
});

export const overwatchGenerator = createStaticGenerator({
  name: "overwatch", flag: "overwatch", flagArg: "<battletag>", description: "Overwatch player profile",
  category: "gaming", platform: "overwatch", profileUrl: (i) => `https://overwatch.blizzard.com/en-us/career/${i}/`,
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "overwatch", url: `https://overwatch.blizzard.com/en-us/career/${input}/`, username: input }] } },
    faq: [{ question: "Do you play Overwatch?", answer: `Yes, my BattleTag is ${input}.`, category: "gaming" }],
    interests: { hobbies: ["overwatch"], topics: ["hero shooter", "esports"] },
  }),
});

export const csgoGenerator = createStaticGenerator({
  name: "csgo", flag: "csgo", flagArg: "<steamid>", description: "CS2/CS:GO player stats",
  category: "gaming", platform: "csgo", profileUrl: (i) => `https://csstats.gg/player/${i}`,
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "csgo", url: `https://csstats.gg/player/${input}`, username: input }] } },
    faq: [{ question: "Do you play CS2?", answer: `Yes, check my stats at csstats.gg/player/${input}.`, category: "gaming" }],
    interests: { hobbies: ["counter-strike"], topics: ["fps", "esports", "competitive gaming"] },
  }),
});

export const pokemongoGenerator = createStaticGenerator({
  name: "pokemongo", flag: "pokemongo", flagArg: "<trainer-code>", description: "Pokemon GO trainer profile",
  category: "gaming", platform: "pokemon-go", profileUrl: "https://pokemon-go.pokemon.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "pokemon-go", url: "https://pokemon-go.pokemon.com/", username: input }] } },
    faq: [{ question: "Do you play Pokemon GO?", answer: `Yes! My trainer code is ${input}. Let's be friends!`, category: "gaming" }],
    interests: { hobbies: ["pokemon go", "augmented reality"], topics: ["pokemon", "mobile gaming", "outdoor gaming"] },
  }),
});

export const moxfieldGenerator = createGenerator({
  name: "moxfield", flag: "moxfield", description: "Moxfield MTG decks and collection",
  category: "gaming", platform: "moxfield", profileUrl: "https://www.moxfield.com/users/{input}",
  apiUrl: "https://api2.moxfield.com/v3/users/{input}",
  extract: (data: unknown) => {
    const d = data as { userName?: string; bio?: string; deckCount?: number };
    return { displayName: d.userName, bio: d.bio, stats: `I have ${d.deckCount ?? 0} decks on Moxfield.`, hobbies: ["magic the gathering", "tcg"], topics: ["mtg", "card games", "deck building"] };
  },
});

export const dndbeyondGenerator = createStaticGenerator({
  name: "dndbeyond", flag: "dndbeyond", flagArg: "<profile-id>", description: "D&D Beyond character collection",
  category: "gaming", platform: "dndbeyond", profileUrl: "https://www.dndbeyond.com/members/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "dndbeyond", url: `https://www.dndbeyond.com/members/${input}`, username: input }] } },
    faq: [{ question: "Do you play D&D?", answer: `Yes, find my characters on D&D Beyond: dndbeyond.com/members/${input}`, category: "gaming" }],
    interests: { hobbies: ["dungeons and dragons", "tabletop rpg"], topics: ["ttrpg", "roleplaying", "world building"] },
  }),
});

export const bgaGenerator = createStaticGenerator({
  name: "bga", flag: "bga", flagArg: "<player-id>", description: "Board Game Arena online games profile",
  category: "gaming", platform: "bga", profileUrl: "https://boardgamearena.com/player?id={input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "boardgamearena", url: `https://boardgamearena.com/player?id=${input}`, username: input }] } },
    faq: [{ question: "Do you play on Board Game Arena?", answer: `Yes, I play board games online on BGA.`, category: "gaming" }],
    interests: { hobbies: ["board games online"], topics: ["board games", "strategy games", "online tabletop"] },
  }),
});

export const nexusmodsGenerator = createGenerator({
  name: "nexusmods", flag: "nexusmods", description: "Nexus Mods profile, published mods",
  category: "gaming", platform: "nexusmods", profileUrl: "https://www.nexusmods.com/users/{input}",
  apiUrl: "https://api.nexusmods.com/v1/users/{input}.json",
  extract: (data: unknown) => {
    const d = data as { name?: string; about_me?: string; member_id?: number };
    return { displayName: d.name, bio: d.about_me, topics: ["game modding", "modding community"], hobbies: ["game modding"] };
  },
});
