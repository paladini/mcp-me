/**
 * Food, Drink & Travel Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const untappdGenerator = createGenerator({
  name: "untappd", flag: "untappd", description: "Untappd beer check-ins, badges",
  category: "food", platform: "untappd", profileUrl: "https://untappd.com/user/{input}",
  apiUrl: "https://api.untappd.com/v4/user/info/{input}?client_id=mcp-me&client_secret=mcp-me",
  extract: (data: unknown) => {
    const d = data as { response?: { user?: { user_name?: string; bio?: string; stats?: { total_checkins?: number; total_beers?: number; total_badges?: number } } } };
    const u = d.response?.user; const s = u?.stats;
    return { displayName: u?.user_name, bio: u?.bio, stats: `I have ${s?.total_checkins ?? 0} check-ins, ${s?.total_beers ?? 0} unique beers, and ${s?.total_badges ?? 0} badges on Untappd.`, hobbies: ["craft beer", "beer tasting"], topics: ["craft beer", "breweries"] };
  },
});

export const vivinoGenerator = createStaticGenerator({
  name: "vivino", flag: "vivino", flagArg: "<user-id>", description: "Vivino wine ratings and collection",
  category: "food", platform: "vivino", profileUrl: "https://www.vivino.com/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "vivino", url: `https://www.vivino.com/users/${input}`, username: input }] } },
    faq: [{ question: "Do you rate wines?", answer: `Yes, I rate wines on Vivino.`, category: "food" }],
    interests: { hobbies: ["wine tasting", "wine collecting"], topics: ["wine", "vineyards", "sommelier"] },
  }),
});

export const yelpGenerator = createStaticGenerator({
  name: "yelp", flag: "yelp", flagArg: "<user-id>", description: "Yelp restaurant reviews",
  category: "food", platform: "yelp", profileUrl: "https://www.yelp.com/user_details?userid={input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "yelp", url: `https://www.yelp.com/user_details?userid=${input}`, username: input }] } },
    faq: [{ question: "Do you review restaurants?", answer: `Yes, I write restaurant reviews on Yelp.`, category: "food" }],
    interests: { hobbies: ["food", "restaurant reviews"], topics: ["restaurants", "food reviews", "dining"] },
  }),
});

export const happycowGenerator = createStaticGenerator({
  name: "happycow", flag: "happycow", description: "HappyCow vegan/vegetarian reviews",
  category: "food", platform: "happycow", profileUrl: "https://www.happycow.net/members/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "happycow", url: `https://www.happycow.net/members/profile/${input}`, username: input }] } },
    faq: [{ question: "Are you vegan/vegetarian?", answer: `I use HappyCow to find plant-based restaurants.`, category: "food" }],
    interests: { hobbies: ["vegan food", "plant-based dining"], topics: ["vegan", "vegetarian", "plant-based"] },
  }),
});

export const allrecipesGenerator = createStaticGenerator({
  name: "allrecipes", flag: "allrecipes", flagArg: "<cook-id>", description: "AllRecipes cooking profile",
  category: "food", platform: "allrecipes", profileUrl: "https://www.allrecipes.com/cook/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "allrecipes", url: `https://www.allrecipes.com/cook/${input}`, username: input }] } },
    faq: [{ question: "Do you cook?", answer: `Yes, find my recipes on AllRecipes.`, category: "food" }],
    interests: { hobbies: ["cooking", "baking", "recipe sharing"], topics: ["cooking", "recipes", "home chef"] },
  }),
});

export const cookpadGenerator = createStaticGenerator({
  name: "cookpad", flag: "cookpad", description: "Cookpad recipe sharing",
  category: "food", platform: "cookpad", profileUrl: "https://cookpad.com/us/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "cookpad", url: `https://cookpad.com/us/users/${input}`, username: input }] } },
    faq: [{ question: "Do you share recipes?", answer: `Yes, I share recipes on Cookpad.`, category: "food" }],
    interests: { hobbies: ["cooking", "recipe creation"], topics: ["home cooking", "recipe sharing"] },
  }),
});

export const tripadvisorGenerator = createStaticGenerator({
  name: "tripadvisor", flag: "tripadvisor", flagArg: "<profile-id>", description: "TripAdvisor travel reviews",
  category: "travel", platform: "tripadvisor", profileUrl: "https://www.tripadvisor.com/Profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "tripadvisor", url: `https://www.tripadvisor.com/Profile/${input}`, username: input }] } },
    faq: [{ question: "Do you review travel spots?", answer: `Yes, I write reviews on TripAdvisor.`, category: "travel" }],
    interests: { hobbies: ["travel", "restaurant reviews"], topics: ["travel reviews", "hotels", "restaurants"] },
  }),
});

export const nomadlistGenerator = createGenerator({
  name: "nomadlist", flag: "nomadlist", description: "NomadList digital nomad profile",
  category: "travel", platform: "nomadlist", profileUrl: "https://nomadlist.com/@{input}",
  apiUrl: "https://nomadlist.com/@{input}.json",
  extract: (data: unknown) => {
    const d = data as { username?: string; bio?: string; location?: { city?: string; country?: string }; trips?: { city: string }[]; stats?: { countries?: number; cities?: number } };
    return { displayName: d.username, bio: d.bio, location: d.location?.city,
      stats: `I've visited ${d.stats?.countries ?? 0} countries and ${d.stats?.cities ?? 0} cities as a digital nomad.`,
      hobbies: ["digital nomad", "traveling"], topics: ["remote work", "digital nomad", "travel"] };
  },
});

export const foursquareGenerator = createStaticGenerator({
  name: "foursquare", flag: "foursquare", flagArg: "<user-id>", description: "Foursquare/Swarm check-ins",
  category: "travel", platform: "foursquare", profileUrl: "https://foursquare.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "foursquare", url: `https://foursquare.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you check in on Foursquare?", answer: `Yes, I check in to places on Foursquare/Swarm.`, category: "travel" }],
    interests: { hobbies: ["exploring cities", "check-ins"], topics: ["local places", "city exploration"] },
  }),
});

export const geocachingGenerator = createStaticGenerator({
  name: "geocaching", flag: "geocaching", description: "Geocaching treasure hunter profile",
  category: "travel", platform: "geocaching", profileUrl: "https://www.geocaching.com/p/default.aspx?u={input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "geocaching", url: `https://www.geocaching.com/p/default.aspx?u=${input}`, username: input }] } },
    faq: [{ question: "Do you geocache?", answer: `Yes, I'm an active geocacher!`, category: "travel" }],
    interests: { hobbies: ["geocaching", "treasure hunting", "outdoor exploration"], topics: ["geocaching", "GPS", "outdoor puzzles"] },
  }),
});

export const polarstepsGenerator = createStaticGenerator({
  name: "polarsteps", flag: "polarsteps", description: "Polarsteps travel tracking",
  category: "travel", platform: "polarsteps", profileUrl: "https://www.polarsteps.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "polarsteps", url: `https://www.polarsteps.com/${input}`, username: input }] } },
    faq: [{ question: "Do you track your travels?", answer: `Yes, I document my travels on Polarsteps.`, category: "travel" }],
    interests: { hobbies: ["travel", "travel documentation"], topics: ["travel diary", "trip tracking"] },
  }),
});

export const wikilockGenerator = createStaticGenerator({
  name: "wikiloc", flag: "wikiloc", flagArg: "<user-id>", description: "Wikiloc hiking/cycling trails",
  category: "travel", platform: "wikiloc", profileUrl: "https://www.wikiloc.com/wikiloc/user.do?id={input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "wikiloc", url: `https://www.wikiloc.com/wikiloc/user.do?id=${input}`, username: input }] } },
    faq: [{ question: "Do you share GPS trails?", answer: `Yes, I share hiking and cycling trails on Wikiloc.`, category: "travel" }],
    interests: { hobbies: ["hiking", "trail sharing"], topics: ["GPS trails", "hiking routes", "cycling routes"] },
  }),
});

export const atlasObscuraGenerator = createStaticGenerator({
  name: "atlasobscura", flag: "atlasobscura", description: "Atlas Obscura curious places visited",
  category: "travel", platform: "atlasobscura", profileUrl: "https://www.atlasobscura.com/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "atlasobscura", url: `https://www.atlasobscura.com/users/${input}`, username: input }] } },
    faq: [{ question: "Do you visit unusual places?", answer: `Yes, I explore curious and hidden places on Atlas Obscura.`, category: "travel" }],
    interests: { hobbies: ["offbeat travel", "hidden gems"], topics: ["curious places", "unusual attractions", "hidden wonders"] },
  }),
});

export const roameGenerator = createStaticGenerator({
  name: "roame", flag: "roame", flagArg: "<travel-map-id>", description: "Travel map / visited countries",
  category: "travel", platform: "roame", profileUrl: "https://roamr.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "travel-map", url: `https://roamr.com/${input}`, username: input }] } },
    faq: [{ question: "How many countries have you visited?", answer: `Check out my travel map at roamr.com/${input}`, category: "travel" }],
    interests: { hobbies: ["traveling", "country counting"], topics: ["world travel", "travel map", "countries visited"] },
  }),
});

export const couchsurfingGenerator = createStaticGenerator({
  name: "couchsurfing", flag: "couchsurfing", description: "Couchsurfing host/guest profile",
  category: "travel", platform: "couchsurfing", profileUrl: "https://www.couchsurfing.com/people/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "couchsurfing", url: `https://www.couchsurfing.com/people/${input}`, username: input }] } },
    faq: [{ question: "Do you Couchsurf?", answer: `Yes, I'm on Couchsurfing as a host/traveler.`, category: "travel" }],
    interests: { hobbies: ["couchsurfing", "cultural exchange"], topics: ["budget travel", "cultural exchange", "hospitality"] },
  }),
});

export const beeradvocateGenerator = createStaticGenerator({
  name: "beeradvocate", flag: "beeradvocate", description: "BeerAdvocate ratings and reviews",
  category: "food", platform: "beeradvocate", profileUrl: "https://www.beeradvocate.com/user/beers/{input}/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "beeradvocate", url: `https://www.beeradvocate.com/user/beers/${input}/`, username: input }] } },
    faq: [{ question: "Do you rate beers?", answer: `Yes, I review beers on BeerAdvocate.`, category: "food" }],
    interests: { hobbies: ["beer tasting", "beer reviewing"], topics: ["beer", "craft beer", "breweries"] },
  }),
});

export const coffeeGenerator = createStaticGenerator({
  name: "buymeacoffee", flag: "buymeacoffee", description: "Buy Me a Coffee creator profile",
  category: "food", platform: "buymeacoffee", profileUrl: "https://www.buymeacoffee.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "buymeacoffee", url: `https://www.buymeacoffee.com/${input}`, username: input }], website: `https://www.buymeacoffee.com/${input}` } },
    faq: [{ question: "Can I support your work?", answer: `Yes! Buy me a coffee at buymeacoffee.com/${input}`, category: "social" }],
    interests: { topics: ["creator economy", "content creation"] },
  }),
});

export const whiskybaseGenerator = createStaticGenerator({
  name: "whiskybase", flag: "whiskybase", description: "Whiskybase whisky collection",
  category: "food", platform: "whiskybase", profileUrl: "https://www.whiskybase.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "whiskybase", url: `https://www.whiskybase.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you collect whisky?", answer: `Yes, I track my whisky collection on Whiskybase.`, category: "food" }],
    interests: { hobbies: ["whisky", "spirits"], topics: ["whisky", "scotch", "bourbon", "distilleries"] },
  }),
});
