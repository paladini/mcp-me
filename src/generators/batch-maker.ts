/**
 * Maker, Hardware, DIY & Nature Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const thingiverseGenerator = createGenerator({
  name: "thingiverse", flag: "thingiverse", flagArg: "<user-id>", description: "Thingiverse 3D printing designs",
  category: "maker", platform: "thingiverse", profileUrl: "https://www.thingiverse.com/{input}/designs",
  apiUrl: "https://api.thingiverse.com/users/{input}",
  extract: (data: unknown) => {
    const d = data as { name?: string; bio?: string; count_of_designs?: number; count_of_followers?: number; location?: string };
    return { displayName: d.name, bio: d.bio, location: d.location, stats: `I have ${d.count_of_designs ?? 0} 3D designs and ${d.count_of_followers ?? 0} followers on Thingiverse.`, hobbies: ["3d printing", "maker"], topics: ["3d printing", "maker movement", "open hardware"] };
  },
});

export const printablesGenerator = createStaticGenerator({
  name: "printables", flag: "printables", description: "Printables (Prusa) 3D models",
  category: "maker", platform: "printables", profileUrl: "https://www.printables.com/@{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "printables", url: `https://www.printables.com/@${input}`, username: input }] } },
    faq: [{ question: "Do you 3D print?", answer: `Yes, find my 3D models on Printables.`, category: "maker" }],
    interests: { hobbies: ["3d printing", "CAD design"], topics: ["3d printing", "prusa", "maker"] },
  }),
});

export const instructablesGenerator = createGenerator({
  name: "instructables", flag: "instructables", description: "Instructables DIY projects",
  category: "maker", platform: "instructables", profileUrl: "https://www.instructables.com/member/{input}",
  apiUrl: "https://www.instructables.com/json-api/showAuthorInstructables?author={input}&limit=10",
  extract: (data: unknown) => {
    const d = data as { instructables?: { title: string; url: string }[] };
    const items = d.instructables ?? [];
    return { stats: `I have ${items.length}+ DIY projects on Instructables.`,
      projects: items.slice(0, 5).map(i => ({ name: i.title, description: "DIY project", url: `https://www.instructables.com${i.url}` })),
      hobbies: ["DIY", "making"], topics: ["diy", "maker", "tutorials"] };
  },
});

export const hackadayGenerator = createGenerator({
  name: "hackaday", flag: "hackaday", description: "Hackaday.io hardware projects",
  category: "maker", platform: "hackaday", profileUrl: "https://hackaday.io/{input}",
  apiUrl: "https://api.hackaday.io/v1/users/{input}?api_key=mcp-me",
  extract: (data: unknown) => {
    const d = data as { screen_name?: string; about_me?: string; projects_count?: number; location?: string };
    return { displayName: d.screen_name, bio: d.about_me, location: d.location, stats: `I have ${d.projects_count ?? 0} hardware projects on Hackaday.io.`, hobbies: ["electronics", "hardware hacking"], topics: ["electronics", "hardware", "iot", "embedded"] };
  },
});

export const hacksterGenerator = createStaticGenerator({
  name: "hackster", flag: "hackster", description: "Hackster.io IoT/hardware projects",
  category: "maker", platform: "hackster", profileUrl: "https://www.hackster.io/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "hackster", url: `https://www.hackster.io/${input}`, username: input }] } },
    faq: [{ question: "Do you build hardware projects?", answer: `Yes, find my IoT and hardware projects on Hackster.io.`, category: "maker" }],
    interests: { hobbies: ["iot", "hardware projects"], topics: ["iot", "arduino", "raspberry pi", "embedded systems"] },
  }),
});

export const tindieGenerator = createStaticGenerator({
  name: "tindie", flag: "tindie", description: "Tindie indie hardware marketplace",
  category: "maker", platform: "tindie", profileUrl: "https://www.tindie.com/stores/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "tindie", url: `https://www.tindie.com/stores/${input}`, username: input }] } },
    faq: [{ question: "Do you sell hardware?", answer: `Yes, I sell indie hardware on Tindie.`, category: "maker" }],
    interests: { hobbies: ["hardware design", "electronics"], topics: ["indie hardware", "pcb design", "electronics"] },
  }),
});

export const adafruitGenerator = createStaticGenerator({
  name: "adafruit", flag: "adafruit", description: "Adafruit learning system profile",
  category: "maker", platform: "adafruit", profileUrl: "https://io.adafruit.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "adafruit", url: `https://io.adafruit.com/${input}`, username: input }] } },
    faq: [{ question: "Do you use Adafruit?", answer: `Yes, I build projects with Adafruit components.`, category: "maker" }],
    interests: { hobbies: ["electronics", "circuitpython"], topics: ["adafruit", "circuitpython", "neopixels", "sensors"] },
  }),
});

export const arduinoGenerator = createStaticGenerator({
  name: "arduino", flag: "arduino", description: "Arduino Project Hub profile",
  category: "maker", platform: "arduino", profileUrl: "https://projecthub.arduino.cc/members/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "arduino", url: `https://projecthub.arduino.cc/members/${input}`, username: input }] } },
    faq: [{ question: "Do you build with Arduino?", answer: `Yes, I create Arduino projects!`, category: "maker" }],
    interests: { hobbies: ["arduino", "electronics"], topics: ["arduino", "microcontrollers", "embedded programming"] },
    skills: { technical: [{ name: "Arduino", category: "embedded" }, { name: "C++", category: "programming" }] },
  }),
});

export const inaturalistGenerator = createGenerator({
  name: "inaturalist", flag: "inaturalist", description: "iNaturalist nature observations",
  category: "nature", platform: "inaturalist", profileUrl: "https://www.inaturalist.org/people/{input}",
  apiUrl: "https://api.inaturalist.org/v1/users/{input}",
  extract: (data: unknown) => {
    const d = data as { results?: { login?: string; name?: string; observations_count?: number; species_count?: number; identifications_count?: number }[] };
    const u = d.results?.[0];
    return { displayName: u?.name, stats: `I have ${u?.observations_count ?? 0} nature observations and ${u?.species_count ?? 0} species identified on iNaturalist.`, hobbies: ["nature observation", "citizen science"], topics: ["biodiversity", "nature", "citizen science", "ecology"] };
  },
});

export const ebirdGenerator = createStaticGenerator({
  name: "ebird", flag: "ebird", flagArg: "<ebird-id>", description: "eBird birding observations",
  category: "nature", platform: "ebird", profileUrl: "https://ebird.org/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "ebird", url: `https://ebird.org/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you go birding?", answer: `Yes, I log bird observations on eBird!`, category: "nature" }],
    interests: { hobbies: ["birding", "birdwatching"], topics: ["ornithology", "bird identification", "wildlife"] },
  }),
});

export const plantnetGenerator = createStaticGenerator({
  name: "plantnet", flag: "plantnet", description: "PlantNet plant identification",
  category: "nature", platform: "plantnet", profileUrl: "https://identify.plantnet.org/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "plantnet", url: "https://identify.plantnet.org/", username: input }] } },
    faq: [{ question: "Do you identify plants?", answer: `Yes, I use PlantNet for plant identification.`, category: "nature" }],
    interests: { hobbies: ["botany", "plant identification"], topics: ["plants", "botany", "flora", "nature identification"] },
  }),
});

export const zooniverseGenerator = createStaticGenerator({
  name: "zooniverse", flag: "zooniverse", description: "Zooniverse citizen science projects",
  category: "nature", platform: "zooniverse", profileUrl: "https://www.zooniverse.org/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "zooniverse", url: `https://www.zooniverse.org/users/${input}`, username: input }] } },
    faq: [{ question: "Do you contribute to citizen science?", answer: `Yes, I classify data on Zooniverse citizen science projects.`, category: "science" }],
    interests: { hobbies: ["citizen science"], topics: ["zooniverse", "citizen science", "data classification", "astronomy"] },
  }),
});

export const gbifGenerator = createStaticGenerator({
  name: "gbif", flag: "gbif", flagArg: "<user-name>", description: "GBIF biodiversity data contributor",
  category: "nature", platform: "gbif", profileUrl: "https://www.gbif.org/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "gbif", url: `https://www.gbif.org/user/${input}`, username: input }] } },
    faq: [{ question: "Do you contribute biodiversity data?", answer: `Yes, I contribute to the Global Biodiversity Information Facility.`, category: "science" }],
    interests: { topics: ["biodiversity", "ecology", "species data", "conservation"] },
  }),
});

export const gardeningGenerator = createStaticGenerator({
  name: "gardenate", flag: "gardenate", flagArg: "<garden-name>", description: "Garden planner profile",
  category: "nature", platform: "gardenate", profileUrl: "https://www.gardenate.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "gardenate", url: "https://www.gardenate.com/", username: input }] } },
    faq: [{ question: "Do you garden?", answer: `Yes, I maintain a garden and track my planting schedule.`, category: "nature" }],
    interests: { hobbies: ["gardening", "urban farming"], topics: ["gardening", "permaculture", "composting", "growing food"] },
  }),
});

export const observationOrgGenerator = createStaticGenerator({
  name: "observationorg", flag: "observationorg", flagArg: "<user-id>", description: "Observation.org wildlife sightings",
  category: "nature", platform: "observationorg", profileUrl: "https://observation.org/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "observation.org", url: `https://observation.org/users/${input}`, username: input }] } },
    faq: [{ question: "Do you log wildlife sightings?", answer: `Yes, I track nature observations on Observation.org.`, category: "nature" }],
    interests: { hobbies: ["wildlife observation"], topics: ["wildlife", "nature", "species tracking"] },
  }),
});

export const raspberrypiGenerator = createStaticGenerator({
  name: "raspberrypi", flag: "raspberrypi", description: "Raspberry Pi projects profile",
  category: "maker", platform: "raspberrypi", profileUrl: "https://www.raspberrypi.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "raspberrypi", url: "https://www.raspberrypi.com/", username: input }] } },
    faq: [{ question: "Do you build with Raspberry Pi?", answer: `Yes, I build projects with Raspberry Pi!`, category: "maker" }],
    interests: { hobbies: ["raspberry pi", "single board computers"], topics: ["raspberry pi", "linux", "home lab", "automation"] },
    skills: { technical: [{ name: "Raspberry Pi", category: "hardware" }, { name: "Linux", category: "os" }] },
  }),
});

export const homeassistantGenerator = createStaticGenerator({
  name: "homeassistant", flag: "homeassistant", flagArg: "<ha-community-user>", description: "Home Assistant smart home profile",
  category: "maker", platform: "homeassistant", profileUrl: "https://community.home-assistant.io/u/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "homeassistant", url: `https://community.home-assistant.io/u/${input}`, username: input }] } },
    faq: [{ question: "Do you do home automation?", answer: `Yes, I use Home Assistant for my smart home.`, category: "maker" }],
    interests: { hobbies: ["home automation", "smart home"], topics: ["home assistant", "zigbee", "mqtt", "iot", "smart home"] },
  }),
});

export const oshwaGenerator = createStaticGenerator({
  name: "oshwa", flag: "oshwa", flagArg: "<project-uid>", description: "OSHWA certified open hardware",
  category: "maker", platform: "oshwa", profileUrl: "https://certification.oshwa.org/list.html",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "oshwa", url: "https://certification.oshwa.org/list.html", username: input }] } },
    faq: [{ question: "Do you make open source hardware?", answer: `Yes, I create OSHWA certified open hardware.`, category: "maker" }],
    interests: { hobbies: ["open source hardware"], topics: ["open hardware", "oshwa", "free hardware design"] },
  }),
});

export const mycologyGenerator = createStaticGenerator({
  name: "mushroomobserver", flag: "mushroomobserver", description: "Mushroom Observer mycology profile",
  category: "nature", platform: "mushroomobserver", profileUrl: "https://mushroomobserver.org/observer/show_user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "mushroomobserver", url: `https://mushroomobserver.org/observer/show_user/${input}`, username: input }] } },
    faq: [{ question: "Are you into mycology?", answer: `Yes, I observe and identify mushrooms on Mushroom Observer!`, category: "nature" }],
    interests: { hobbies: ["mycology", "mushroom foraging"], topics: ["mushrooms", "fungi", "mycology", "foraging"] },
  }),
});
