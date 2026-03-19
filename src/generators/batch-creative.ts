/**
 * Creative & Art Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const deviantartGenerator = createStaticGenerator({
  name: "deviantart", flag: "deviantart", description: "DeviantArt art portfolio",
  category: "creative", platform: "deviantart", profileUrl: "https://www.deviantart.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "deviantart", url: `https://www.deviantart.com/${input}`, username: input }] } },
    faq: [{ question: "Do you share art?", answer: `Yes, my DeviantArt portfolio is at deviantart.com/${input}`, category: "art" }],
    interests: { hobbies: ["digital art", "illustration"], topics: ["digital art", "illustration", "fan art"] },
  }),
});

export const artstationGenerator = createGenerator({
  name: "artstation", flag: "artstation", description: "ArtStation professional art portfolio",
  category: "creative", platform: "artstation", profileUrl: "https://www.artstation.com/{input}",
  apiUrl: "https://www.artstation.com/users/{input}.json",
  extract: (data: unknown) => {
    const d = data as { full_name?: string; headline?: string; city?: string; country?: string; followers_count?: number; project_views_count?: number; skills?: { name: string }[] };
    return { displayName: d.full_name, bio: d.headline, location: [d.city, d.country].filter(Boolean).join(", "),
      stats: `I have ${d.followers_count ?? 0} followers and ${(d.project_views_count ?? 0).toLocaleString()} project views on ArtStation.`,
      skills: (d.skills ?? []).slice(0, 10).map(s => ({ name: s.name, category: "art" })),
      topics: ["concept art", "3d art", "digital art"], hobbies: ["art"] };
  },
});

export const pixivGenerator = createStaticGenerator({
  name: "pixiv", flag: "pixiv", flagArg: "<user-id>", description: "Pixiv illustration profile",
  category: "creative", platform: "pixiv", profileUrl: "https://www.pixiv.net/en/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "pixiv", url: `https://www.pixiv.net/en/users/${input}`, username: input }] } },
    faq: [{ question: "Do you post illustrations?", answer: `Yes, find my artwork on Pixiv: pixiv.net/en/users/${input}`, category: "art" }],
    interests: { hobbies: ["illustration", "drawing", "anime art"], topics: ["illustration", "anime", "manga art"] },
  }),
});

export const behanceGenerator = createGenerator({
  name: "behance", flag: "behance", description: "Behance creative portfolio",
  category: "creative", platform: "behance", profileUrl: "https://www.behance.net/{input}",
  apiUrl: "https://www.behance.net/v2/users/{input}?api_key=mcp-me",
  extract: (data: unknown) => {
    const d = data as { user?: { display_name?: string; city?: string; country?: string; sections?: Record<string, unknown>; stats?: { followers?: number; appreciations?: number; views?: number } } };
    const u = d.user;
    return { displayName: u?.display_name, location: [u?.city, u?.country].filter(Boolean).join(", "),
      stats: `I have ${u?.stats?.followers ?? 0} followers and ${(u?.stats?.views ?? 0).toLocaleString()} views on Behance.`,
      topics: ["design", "creative portfolio"], hobbies: ["design"] };
  },
});

export const flickrGenerator = createGenerator({
  name: "flickr", flag: "flickr", flagArg: "<nsid>", description: "Flickr photography portfolio",
  category: "photography", platform: "flickr", profileUrl: "https://www.flickr.com/people/{input}",
  apiUrl: "https://api.flickr.com/services/rest/?method=flickr.people.getInfo&user_id={input}&format=json&nojsoncallback=1&api_key=mcp-me",
  extract: (data: unknown) => {
    const d = data as { person?: { username?: { _content?: string }; description?: { _content?: string }; photos?: { count?: { _content?: string } }; location?: { _content?: string } } };
    const p = d.person;
    return { displayName: p?.username?._content, bio: p?.description?._content, location: p?.location?._content,
      stats: `I have ${p?.photos?.count?._content ?? "many"} photos on Flickr.`,
      topics: ["photography"], hobbies: ["photography"] };
  },
});

export const px500Generator = createGenerator({
  name: "500px", flag: "500px", description: "500px photography community",
  category: "photography", platform: "500px", profileUrl: "https://500px.com/p/{input}",
  apiUrl: "https://api.500px.com/v1/users/show?username={input}",
  extract: (data: unknown) => {
    const d = data as { user?: { fullname?: string; about?: string; photos_count?: number; followers_count?: number; city?: string; country?: string } };
    const u = d.user;
    return { displayName: u?.fullname, bio: u?.about, location: [u?.city, u?.country].filter(Boolean).join(", "),
      stats: `I have ${u?.photos_count ?? 0} photos and ${u?.followers_count ?? 0} followers on 500px.`,
      topics: ["photography", "visual arts"], hobbies: ["photography"] };
  },
});

export const sketchfabGenerator = createGenerator({
  name: "sketchfab", flag: "sketchfab", description: "Sketchfab 3D models portfolio",
  category: "creative", platform: "sketchfab", profileUrl: "https://sketchfab.com/{input}",
  apiUrl: "https://api.sketchfab.com/v3/users?username={input}",
  extract: (data: unknown) => {
    const d = data as { results?: { displayName?: string; biography?: string; modelCount?: number; followerCount?: number }[] };
    const u = d.results?.[0];
    return { displayName: u?.displayName, bio: u?.biography, stats: `I have ${u?.modelCount ?? 0} 3D models on Sketchfab.`,
      skills: [{ name: "3D Modeling", category: "creative" }], topics: ["3d modeling", "3d art"], hobbies: ["3d art"] };
  },
});

export const society6Generator = createStaticGenerator({
  name: "society6", flag: "society6", description: "Society6 art prints shop",
  category: "creative", platform: "society6", profileUrl: "https://society6.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "society6", url: `https://society6.com/${input}`, username: input }] } },
    faq: [{ question: "Do you sell art prints?", answer: `Yes, my art prints are on Society6: society6.com/${input}`, category: "art" }],
    interests: { hobbies: ["art", "print design"], topics: ["art prints", "merchandise design"] },
  }),
});

export const redbubbleGenerator = createStaticGenerator({
  name: "redbubble", flag: "redbubble", description: "Redbubble merch designs",
  category: "creative", platform: "redbubble", profileUrl: "https://www.redbubble.com/people/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "redbubble", url: `https://www.redbubble.com/people/${input}`, username: input }] } },
    faq: [{ question: "Do you design merchandise?", answer: `Yes, find my designs on Redbubble: redbubble.com/people/${input}`, category: "art" }],
    interests: { hobbies: ["graphic design", "merchandise"], topics: ["print on demand", "illustration", "graphic design"] },
  }),
});

export const codepenGenerator = createGenerator({
  name: "codepen", flag: "codepen", description: "CodePen frontend demos, pens",
  category: "creative", platform: "codepen", profileUrl: "https://codepen.io/{input}",
  apiUrl: "https://cpv2api.com/profile/{input}",
  extract: (data: unknown) => {
    const d = data as { data?: { username?: string; bio?: string; location?: string; followers?: number; pens?: number } };
    const u = d.data;
    return { displayName: u?.username, bio: u?.bio, location: u?.location,
      stats: `I have ${u?.pens ?? 0} pens and ${u?.followers ?? 0} followers on CodePen.`,
      skills: [{ name: "CSS", category: "frontend" }, { name: "HTML", category: "frontend" }],
      topics: ["frontend", "css art", "web design"], hobbies: ["creative coding"] };
  },
});

export const observablehqGenerator = createStaticGenerator({
  name: "observablehq", flag: "observablehq", description: "Observable HQ data notebooks",
  category: "creative", platform: "observablehq", profileUrl: "https://observablehq.com/@{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "observablehq", url: `https://observablehq.com/@${input}`, username: input }] } },
    faq: [{ question: "Do you make data visualizations?", answer: `Yes, check out my notebooks on Observable HQ: observablehq.com/@${input}`, category: "creative" }],
    interests: { hobbies: ["data visualization"], topics: ["d3.js", "data viz", "notebooks", "javascript"] },
    skills: { technical: [{ name: "Data Visualization", category: "creative" }, { name: "D3.js", category: "library" }] },
  }),
});

export const glitchGenerator = createStaticGenerator({
  name: "glitch", flag: "glitch", description: "Glitch web apps and remixes",
  category: "creative", platform: "glitch", profileUrl: "https://glitch.com/@{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "glitch", url: `https://glitch.com/@${input}`, username: input }] } },
    faq: [{ question: "Do you build on Glitch?", answer: `Yes, find my projects at glitch.com/@${input}`, category: "creative" }],
    interests: { hobbies: ["web development", "creative coding"], topics: ["web apps", "remixing", "creative coding"] },
  }),
});

export const codesandboxGenerator = createStaticGenerator({
  name: "codesandbox", flag: "codesandbox", description: "CodeSandbox online IDE projects",
  category: "creative", platform: "codesandbox", profileUrl: "https://codesandbox.io/u/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "codesandbox", url: `https://codesandbox.io/u/${input}`, username: input }] } },
    faq: [{ question: "Do you use CodeSandbox?", answer: `Yes, my sandboxes are at codesandbox.io/u/${input}`, category: "creative" }],
    interests: { topics: ["web development", "prototyping", "sandboxes"] },
  }),
});

export const replitGenerator = createGenerator({
  name: "replit", flag: "replit", description: "Replit coding projects, repls",
  category: "creative", platform: "replit", profileUrl: "https://replit.com/@{input}",
  apiUrl: "https://replit.com/data/profiles/{input}",
  extract: (data: unknown) => {
    const d = data as { username?: string; bio?: string; followerCount?: number; isHacker?: boolean };
    return { displayName: d.username, bio: d.bio,
      stats: `I have ${d.followerCount ?? 0} followers on Replit${d.isHacker ? " (Hacker plan)" : ""}.`,
      topics: ["online coding", "prototyping"], hobbies: ["coding"] };
  },
});

export const figmaGenerator = createStaticGenerator({
  name: "figma", flag: "figma", flagArg: "<profile-url>", description: "Figma Community plugins and files",
  category: "creative", platform: "figma", profileUrl: "https://www.figma.com/@{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "figma", url: `https://www.figma.com/@${input}`, username: input }] } },
    faq: [{ question: "Do you design in Figma?", answer: `Yes, check my Figma Community profile: figma.com/@${input}`, category: "design" }],
    interests: { hobbies: ["ui design", "ux design"], topics: ["figma", "design systems", "ui/ux"] },
    skills: { tools: [{ name: "Figma", category: "design" }] },
  }),
});

export const canvaGenerator = createStaticGenerator({
  name: "canva", flag: "canva", description: "Canva design templates",
  category: "creative", platform: "canva", profileUrl: "https://www.canva.com/p/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "canva", url: `https://www.canva.com/p/${input}`, username: input }] } },
    faq: [{ question: "Do you create templates?", answer: `Yes, I create design templates on Canva.`, category: "design" }],
    interests: { hobbies: ["graphic design"], topics: ["canva", "templates", "visual content"] },
  }),
});

export const processingGenerator = createStaticGenerator({
  name: "openprocessing", flag: "openprocessing", description: "OpenProcessing creative coding sketches",
  category: "creative", platform: "openprocessing", profileUrl: "https://openprocessing.org/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "openprocessing", url: `https://openprocessing.org/user/${input}`, username: input }] } },
    faq: [{ question: "Do you do creative coding?", answer: `Yes, my creative coding sketches are on OpenProcessing.`, category: "creative" }],
    interests: { hobbies: ["creative coding", "generative art"], topics: ["p5.js", "processing", "generative art", "creative coding"] },
  }),
});

export const shadertoyGenerator = createStaticGenerator({
  name: "shadertoy", flag: "shadertoy", description: "Shadertoy GLSL shader creations",
  category: "creative", platform: "shadertoy", profileUrl: "https://www.shadertoy.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "shadertoy", url: `https://www.shadertoy.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you write shaders?", answer: `Yes, I create GLSL shaders on Shadertoy.`, category: "creative" }],
    interests: { hobbies: ["shader programming", "graphics programming"], topics: ["GLSL", "shaders", "real-time graphics", "gpu programming"] },
    skills: { technical: [{ name: "GLSL", category: "graphics" }, { name: "GPU Programming", category: "graphics" }] },
  }),
});

export const threeJsGenerator = createStaticGenerator({
  name: "threejs", flag: "threejs", flagArg: "<github-user>", description: "Three.js/WebGL portfolio",
  category: "creative", platform: "threejs", profileUrl: "https://threejs.org/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "threejs", url: `https://github.com/${input}`, username: input }] } },
    interests: { hobbies: ["3d web graphics", "webgl"], topics: ["three.js", "webgl", "web 3d", "interactive graphics"] },
    skills: { technical: [{ name: "Three.js", category: "3d-web" }, { name: "WebGL", category: "graphics" }] },
  }),
});
