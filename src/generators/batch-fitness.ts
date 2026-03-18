/**
 * Fitness, Sports & Outdoor Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const stravaGenerator = createGenerator({
  name: "strava", flag: "strava", flagArg: "<athlete-id>", description: "Strava running/cycling activities",
  category: "fitness", platform: "strava", profileUrl: "https://www.strava.com/athletes/{input}",
  apiUrl: "https://www.strava.com/api/v3/athletes/{input}/stats",
  extract: (data: unknown) => {
    const d = data as { all_run_totals?: { count?: number; distance?: number }; all_ride_totals?: { count?: number; distance?: number } };
    const runs = d.all_run_totals?.count ?? 0;
    const rides = d.all_ride_totals?.count ?? 0;
    return { stats: `I've logged ${runs} runs and ${rides} rides on Strava.`, hobbies: ["running", "cycling"], topics: ["endurance sports", "fitness tracking"] };
  },
});

export const garminGenerator = createStaticGenerator({
  name: "garmin", flag: "garmin", flagArg: "<display-name>", description: "Garmin Connect fitness profile",
  category: "fitness", platform: "garmin", profileUrl: "https://connect.garmin.com/modern/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "garmin", url: `https://connect.garmin.com/modern/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you use Garmin?", answer: `Yes, I track my fitness with Garmin Connect.`, category: "fitness" }],
    interests: { hobbies: ["fitness", "running", "cycling"], topics: ["fitness tracking", "wearables"] },
  }),
});

export const myfitnesspalGenerator = createStaticGenerator({
  name: "myfitnesspal", flag: "myfitnesspal", description: "MyFitnessPal nutrition tracking",
  category: "fitness", platform: "myfitnesspal", profileUrl: "https://www.myfitnesspal.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "myfitnesspal", url: `https://www.myfitnesspal.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you track nutrition?", answer: `Yes, I track my nutrition on MyFitnessPal.`, category: "fitness" }],
    interests: { hobbies: ["nutrition tracking", "fitness"], topics: ["nutrition", "calorie counting", "healthy eating"] },
  }),
});

export const pelotonGenerator = createStaticGenerator({
  name: "peloton", flag: "peloton", flagArg: "<username>", description: "Peloton workout profile",
  category: "fitness", platform: "peloton", profileUrl: "https://members.onepeloton.com/members/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "peloton", url: `https://members.onepeloton.com/members/${input}`, username: input }] } },
    faq: [{ question: "Do you Peloton?", answer: `Yes, find me on Peloton as ${input}!`, category: "fitness" }],
    interests: { hobbies: ["cycling", "fitness classes"], topics: ["peloton", "indoor cycling", "HIIT"] },
  }),
});

export const runkeeperGenerator = createStaticGenerator({
  name: "runkeeper", flag: "runkeeper", description: "Runkeeper running profile",
  category: "fitness", platform: "runkeeper", profileUrl: "https://runkeeper.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "runkeeper", url: `https://runkeeper.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you run?", answer: `Yes, I track my runs on Runkeeper.`, category: "fitness" }],
    interests: { hobbies: ["running"], topics: ["running", "GPS tracking", "fitness"] },
  }),
});

export const habiticaGenerator = createGenerator({
  name: "habitica", flag: "habitica", flagArg: "<user-id>", description: "Habitica gamified habits profile",
  category: "productivity", platform: "habitica", profileUrl: "https://habitica.com/profile/{input}",
  apiUrl: "https://habitica.com/api/v3/members/{input}",
  extract: (data: unknown) => {
    const d = data as { data?: { profile?: { name?: string; blurb?: string }; stats?: { lvl?: number; class?: string } } };
    const p = d.data?.profile;
    const s = d.data?.stats;
    return { displayName: p?.name, bio: p?.blurb, stats: `I'm level ${s?.lvl ?? 1} ${s?.class ?? "warrior"} on Habitica.`, hobbies: ["habit tracking", "gamification"], topics: ["productivity", "gamification", "habits"] };
  },
});

export const alltrailsGenerator = createStaticGenerator({
  name: "alltrails", flag: "alltrails", description: "AllTrails hiking profile",
  category: "fitness", platform: "alltrails", profileUrl: "https://www.alltrails.com/members/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "alltrails", url: `https://www.alltrails.com/members/${input}`, username: input }] } },
    faq: [{ question: "Do you hike?", answer: `Yes, I track my hikes on AllTrails.`, category: "fitness" }],
    interests: { hobbies: ["hiking", "trail running", "nature walks"], topics: ["hiking trails", "outdoor recreation", "nature"] },
  }),
});

export const parkrunGenerator = createStaticGenerator({
  name: "parkrun", flag: "parkrun", flagArg: "<athlete-id>", description: "parkrun Saturday 5K results",
  category: "fitness", platform: "parkrun", profileUrl: "https://www.parkrun.com/parkrunner/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "parkrun", url: `https://www.parkrun.com/parkrunner/${input}`, username: input }] } },
    faq: [{ question: "Do you do parkrun?", answer: `Yes, I do parkrun! My athlete ID is ${input}.`, category: "fitness" }],
    interests: { hobbies: ["parkrun", "running", "5K"], topics: ["community running", "parkrun", "5K running"] },
  }),
});

export const zwiftGenerator = createStaticGenerator({
  name: "zwift", flag: "zwift", description: "Zwift indoor cycling/running profile",
  category: "fitness", platform: "zwift", profileUrl: "https://www.zwift.com/athlete/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "zwift", url: `https://www.zwift.com/athlete/${input}`, username: input }] } },
    faq: [{ question: "Do you use Zwift?", answer: `Yes, I ride and run on Zwift!`, category: "fitness" }],
    interests: { hobbies: ["indoor cycling", "virtual running"], topics: ["zwift", "indoor training", "virtual racing"] },
  }),
});

export const komootGenerator = createStaticGenerator({
  name: "komoot", flag: "komoot", flagArg: "<user-id>", description: "Komoot hiking/cycling adventures",
  category: "fitness", platform: "komoot", profileUrl: "https://www.komoot.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "komoot", url: `https://www.komoot.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you use Komoot?", answer: `Yes, I plan routes and track adventures on Komoot.`, category: "fitness" }],
    interests: { hobbies: ["hiking", "cycling", "adventure"], topics: ["route planning", "outdoor navigation"] },
  }),
});

export const fitocracyGenerator = createStaticGenerator({
  name: "fitocracy", flag: "fitocracy", description: "Fitocracy gamified workouts",
  category: "fitness", platform: "fitocracy", profileUrl: "https://www.fitocracy.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "fitocracy", url: `https://www.fitocracy.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you gamify workouts?", answer: `Yes, I level up my fitness on Fitocracy!`, category: "fitness" }],
    interests: { hobbies: ["weightlifting", "fitness"], topics: ["gamified fitness", "strength training"] },
  }),
});

export const corosGenerator = createStaticGenerator({
  name: "coros", flag: "coros", description: "COROS watch training data",
  category: "fitness", platform: "coros", profileUrl: "https://traininghub.coros.com/athlete/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "coros", url: `https://traininghub.coros.com/athlete/${input}`, username: input }] } },
    faq: [{ question: "Do you use COROS?", answer: `Yes, I train with a COROS watch.`, category: "fitness" }],
    interests: { hobbies: ["endurance sports"], topics: ["GPS watches", "training metrics"] },
  }),
});

export const espnFantasyGenerator = createStaticGenerator({
  name: "espnfantasy", flag: "espnfantasy", flagArg: "<team-id>", description: "ESPN Fantasy sports profile",
  category: "sports", platform: "espn", profileUrl: "https://fantasy.espn.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "espn-fantasy", url: "https://fantasy.espn.com/", username: input }] } },
    faq: [{ question: "Do you play fantasy sports?", answer: `Yes, I play fantasy sports on ESPN.`, category: "sports" }],
    interests: { hobbies: ["fantasy sports"], topics: ["fantasy football", "fantasy basketball", "sports analytics"] },
  }),
});

export const transfermarktGenerator = createStaticGenerator({
  name: "transfermarkt", flag: "transfermarkt", flagArg: "<user-id>", description: "Transfermarkt football profile",
  category: "sports", platform: "transfermarkt", profileUrl: "https://www.transfermarkt.com/user/profil/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "transfermarkt", url: `https://www.transfermarkt.com/user/profil/${input}`, username: input }] } },
    faq: [{ question: "Are you into football/soccer?", answer: `Yes, I follow football on Transfermarkt.`, category: "sports" }],
    interests: { hobbies: ["football", "soccer"], topics: ["football transfers", "soccer analytics"] },
  }),
});

export const sofascoreGenerator = createStaticGenerator({
  name: "sofascore", flag: "sofascore", description: "SofaScore live sports follower",
  category: "sports", platform: "sofascore", profileUrl: "https://www.sofascore.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "sofascore", url: `https://www.sofascore.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you follow live sports?", answer: `Yes, I track live scores on SofaScore.`, category: "sports" }],
    interests: { hobbies: ["sports"], topics: ["live scores", "sports statistics"] },
  }),
});

export const f1Generator = createStaticGenerator({
  name: "f1", flag: "f1", flagArg: "<fan-name>", description: "Formula 1 fan profile",
  category: "sports", platform: "f1", profileUrl: "https://www.formula1.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "f1", url: "https://www.formula1.com/", username: input }] } },
    faq: [{ question: "Are you into F1?", answer: `Yes, I'm a Formula 1 fan!`, category: "sports" }],
    interests: { hobbies: ["formula 1", "motorsport"], topics: ["F1", "racing", "motorsport", "grand prix"] },
  }),
});

export const cricketGenerator = createStaticGenerator({
  name: "cricket", flag: "cricket", flagArg: "<player-name>", description: "Cricket fan/player profile",
  category: "sports", platform: "espncricinfo", profileUrl: "https://www.espncricinfo.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "espncricinfo", url: "https://www.espncricinfo.com/", username: input }] } },
    faq: [{ question: "Do you follow cricket?", answer: `Yes, I'm a cricket enthusiast.`, category: "sports" }],
    interests: { hobbies: ["cricket"], topics: ["cricket", "test cricket", "IPL", "cricket stats"] },
  }),
});

export const marathonGenerator = createStaticGenerator({
  name: "marathon", flag: "marathon", flagArg: "<runner-name>", description: "Marathon runner profile",
  category: "fitness", platform: "marathonguide", profileUrl: "https://www.marathonguide.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "marathon", url: "https://www.marathonguide.com/", username: input }] } },
    faq: [{ question: "Do you run marathons?", answer: `Yes, I'm a marathon runner! Look me up as ${input}.`, category: "fitness" }],
    interests: { hobbies: ["marathon running", "endurance racing"], topics: ["marathon", "26.2", "distance running", "race training"] },
  }),
});

export const yogaGenerator = createStaticGenerator({
  name: "yoga", flag: "yoga", flagArg: "<instructor-name>", description: "Yoga practice/teaching profile",
  category: "fitness", platform: "yoga", profileUrl: "https://www.yogaalliance.org/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "yoga-alliance", url: "https://www.yogaalliance.org/", username: input }] } },
    faq: [{ question: "Do you practice yoga?", answer: `Yes, I practice and/or teach yoga.`, category: "fitness" }],
    interests: { hobbies: ["yoga", "meditation", "mindfulness"], topics: ["yoga", "meditation", "wellness", "flexibility"] },
  }),
});
