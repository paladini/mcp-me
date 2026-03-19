/**
 * Code & Dev Extra Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const codeforcesGenerator = createGenerator({
  name: "codeforces", flag: "codeforces", description: "Codeforces competitive programming profile",
  category: "code", platform: "codeforces", profileUrl: "https://codeforces.com/profile/{input}",
  apiUrl: "https://codeforces.com/api/user.info?handles={input}",
  extract: (data: unknown) => {
    const d = data as { result?: { handle?: string; rating?: number; rank?: string; maxRating?: number; contribution?: number }[] };
    const u = d.result?.[0];
    return { displayName: u?.handle, stats: `I'm ${u?.rank ?? "unranked"} on Codeforces (rating: ${u?.rating ?? 0}, max: ${u?.maxRating ?? 0}).`, topics: ["competitive programming", "algorithms"], hobbies: ["competitive programming"] };
  },
});

export const atcoderGenerator = createStaticGenerator({
  name: "atcoder", flag: "atcoder", description: "AtCoder competitive programming profile",
  category: "code", platform: "atcoder", profileUrl: "https://atcoder.jp/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "atcoder", url: `https://atcoder.jp/users/${input}`, username: input }] } },
    faq: [{ question: "Do you do competitive programming?", answer: `Yes, I compete on AtCoder as ${input}.`, category: "code" }],
    interests: { hobbies: ["competitive programming"], topics: ["atcoder", "algorithms", "competitive coding"] },
  }),
});

export const topcoderGenerator = createStaticGenerator({
  name: "topcoder", flag: "topcoder", description: "TopCoder competitive programming profile",
  category: "code", platform: "topcoder", profileUrl: "https://www.topcoder.com/members/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "topcoder", url: `https://www.topcoder.com/members/${input}`, username: input }] } },
    faq: [{ question: "Are you on TopCoder?", answer: `Yes, find my competitive coding profile on TopCoder.`, category: "code" }],
    interests: { topics: ["topcoder", "algorithm challenges", "competitive programming"] },
  }),
});

export const projecteulerGenerator = createStaticGenerator({
  name: "projecteuler", flag: "projecteuler", flagArg: "<member-id>", description: "Project Euler math/programming problems",
  category: "code", platform: "projecteuler", profileUrl: "https://projecteuler.net/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "projecteuler", url: `https://projecteuler.net/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you solve Project Euler problems?", answer: `Yes, I solve math/programming problems on Project Euler.`, category: "code" }],
    interests: { hobbies: ["math puzzles", "problem solving"], topics: ["project euler", "mathematics", "computational math"] },
  }),
});

export const codingameGenerator = createStaticGenerator({
  name: "codingame", flag: "codingame", flagArg: "<user-id>", description: "CodinGame coding challenges",
  category: "code", platform: "codingame", profileUrl: "https://www.codingame.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "codingame", url: `https://www.codingame.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you play CodinGame?", answer: `Yes, I solve coding challenges on CodinGame.`, category: "code" }],
    interests: { hobbies: ["coding games"], topics: ["codingame", "ai bot programming", "code golf"] },
  }),
});

export const dmojGenerator = createStaticGenerator({
  name: "dmoj", flag: "dmoj", description: "DMOJ online judge competitive programming",
  category: "code", platform: "dmoj", profileUrl: "https://dmoj.ca/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "dmoj", url: `https://dmoj.ca/user/${input}`, username: input }] } },
    faq: [{ question: "Are you on DMOJ?", answer: `Yes, I solve problems on DMOJ online judge.`, category: "code" }],
    interests: { topics: ["competitive programming", "online judge", "algorithms"] },
  }),
});

export const kattisGenerator = createGenerator({
  name: "kattis", flag: "kattis", description: "Kattis competitive programming profile",
  category: "code", platform: "kattis", profileUrl: "https://open.kattis.com/users/{input}",
  apiUrl: "https://open.kattis.com/users/{input}",
  apiHeaders: { Accept: "text/html" },
  extract: (_data: unknown, input) => ({
    stats: `I solve competitive programming problems on Kattis as ${input}.`, topics: ["kattis", "competitive programming", "problem solving"],
  }),
});

export const rubygems_Generator = createGenerator({
  name: "rubygems", flag: "rubygems", description: "RubyGems published gems",
  category: "packages", platform: "rubygems", profileUrl: "https://rubygems.org/profiles/{input}",
  apiUrl: "https://rubygems.org/api/v1/owners/{input}/gems.json",
  extract: (data: unknown) => {
    const d = data as { name: string; downloads: number; info: string }[];
    const gems = Array.isArray(d) ? d : [];
    const total = gems.reduce((sum, g) => sum + (g.downloads ?? 0), 0);
    return { stats: `I maintain ${gems.length} Ruby gems with ${total.toLocaleString()} total downloads on RubyGems.`,
      projects: gems.slice(0, 10).map(g => ({ name: g.name, description: g.info?.slice(0, 100) ?? "Ruby gem" })),
      skills: [{ name: "Ruby", category: "programming" }], topics: ["ruby", "gems", "open source"] };
  },
});

export const packagistGenerator = createGenerator({
  name: "packagist", flag: "packagist", flagArg: "<vendor>", description: "Packagist PHP packages",
  category: "packages", platform: "packagist", profileUrl: "https://packagist.org/users/{input}",
  apiUrl: "https://packagist.org/packages/list.json?vendor={input}",
  extract: (data: unknown) => {
    const d = data as { packageNames?: string[] };
    const pkgs = d.packageNames ?? [];
    return { stats: `I maintain ${pkgs.length} PHP packages on Packagist.`,
      projects: pkgs.slice(0, 10).map(p => ({ name: p, description: "PHP package" })),
      skills: [{ name: "PHP", category: "programming" }], topics: ["php", "composer", "packagist"] };
  },
});

export const nugetGenerator = createStaticGenerator({
  name: "nuget", flag: "nuget", flagArg: "<author>", description: "NuGet .NET packages",
  category: "packages", platform: "nuget", profileUrl: "https://www.nuget.org/profiles/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "nuget", url: `https://www.nuget.org/profiles/${input}`, username: input }] } },
    faq: [{ question: "Do you publish .NET packages?", answer: `Yes, find my .NET packages on NuGet.`, category: "packages" }],
    interests: { topics: ["dotnet", "nuget", "c#", "open source"] },
    skills: { technical: [{ name: "C#", category: "programming" }, { name: ".NET", category: "framework" }] },
  }),
});

export const hexpmGenerator = createGenerator({
  name: "hexpm", flag: "hexpm", flagArg: "<user>", description: "Hex.pm Elixir/Erlang packages",
  category: "packages", platform: "hexpm", profileUrl: "https://hex.pm/users/{input}",
  apiUrl: "https://hex.pm/api/users/{input}",
  extract: (data: unknown) => {
    const d = data as { username?: string; packages?: { name: string }[] };
    const pkgs = d.packages ?? [];
    return { displayName: d.username, stats: `I maintain ${pkgs.length} Elixir/Erlang packages on Hex.pm.`,
      skills: [{ name: "Elixir", category: "programming" }], topics: ["elixir", "erlang", "hex"] };
  },
});

export const pubdevGenerator = createGenerator({
  name: "pubdev", flag: "pubdev", flagArg: "<publisher>", description: "pub.dev Dart/Flutter packages",
  category: "packages", platform: "pubdev", profileUrl: "https://pub.dev/publishers/{input}",
  apiUrl: "https://pub.dev/api/search?q=publisher%3A{input}",
  extract: (data: unknown) => {
    const d = data as { packages?: { package: string }[] };
    const pkgs = d.packages ?? [];
    return { stats: `I have ${pkgs.length} Dart/Flutter packages on pub.dev.`,
      skills: [{ name: "Dart", category: "programming" }, { name: "Flutter", category: "framework" }], topics: ["dart", "flutter", "pub.dev"] };
  },
});

export const cocoapodsGenerator = createStaticGenerator({
  name: "cocoapods", flag: "cocoapods", flagArg: "<owner>", description: "CocoaPods iOS/macOS libraries",
  category: "packages", platform: "cocoapods", profileUrl: "https://cocoapods.org/owners/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "cocoapods", url: `https://cocoapods.org/owners/${input}`, username: input }] } },
    faq: [{ question: "Do you publish iOS libraries?", answer: `Yes, I publish CocoaPods for the Apple ecosystem.`, category: "packages" }],
    interests: { topics: ["ios", "macos", "swift", "objective-c"] },
    skills: { technical: [{ name: "Swift", category: "programming" }, { name: "iOS", category: "platform" }] },
  }),
});

export const mavenGenerator = createStaticGenerator({
  name: "maven", flag: "maven", flagArg: "<group-id>", description: "Maven Central Java packages",
  category: "packages", platform: "maven", profileUrl: "https://central.sonatype.com/namespace/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "maven", url: `https://central.sonatype.com/namespace/${input}`, username: input }] } },
    faq: [{ question: "Do you publish Java libraries?", answer: `Yes, find my Java packages on Maven Central.`, category: "packages" }],
    skills: { technical: [{ name: "Java", category: "programming" }] },
    interests: { topics: ["java", "maven", "jvm", "open source"] },
  }),
});

export const sourcehutGenerator = createStaticGenerator({
  name: "sourcehut", flag: "sourcehut", description: "SourceHut sr.ht code hosting profile",
  category: "code", platform: "sourcehut", profileUrl: "https://sr.ht/~{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "sourcehut", url: `https://sr.ht/~${input}`, username: input }] } },
    faq: [{ question: "Are you on SourceHut?", answer: `Yes, I host code on SourceHut (sr.ht).`, category: "code" }],
    interests: { topics: ["sourcehut", "email-driven development", "minimalist tools", "open source"] },
  }),
});

export const wandbGenerator = createStaticGenerator({
  name: "wandb", flag: "wandb", description: "Weights & Biases ML experiments",
  category: "code", platform: "wandb", profileUrl: "https://wandb.ai/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "wandb", url: `https://wandb.ai/${input}`, username: input }] } },
    faq: [{ question: "Do you track ML experiments?", answer: `Yes, I track ML experiments on Weights & Biases.`, category: "code" }],
    interests: { topics: ["machine learning", "mlops", "experiment tracking"] },
    skills: { technical: [{ name: "Machine Learning", category: "ai" }, { name: "MLOps", category: "devops" }] },
  }),
});

export const dagshubGenerator = createStaticGenerator({
  name: "dagshub", flag: "dagshub", description: "DagsHub data science collaboration",
  category: "code", platform: "dagshub", profileUrl: "https://dagshub.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "dagshub", url: `https://dagshub.com/${input}`, username: input }] } },
    faq: [{ question: "Do you collaborate on ML projects?", answer: `Yes, I use DagsHub for data science collaboration.`, category: "code" }],
    interests: { topics: ["data science", "mlops", "dvc", "collaboration"] },
  }),
});

export const giteaGenerator = createStaticGenerator({
  name: "gitea", flag: "gitea", flagArg: "<user@instance>", description: "Gitea self-hosted Git profile",
  category: "code", platform: "gitea", profileUrl: "https://gitea.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "gitea", url: `https://gitea.com/${input}`, username: input }] } },
    faq: [{ question: "Do you self-host code?", answer: `Yes, I use Gitea for self-hosted Git repositories.`, category: "code" }],
    interests: { topics: ["self-hosting", "gitea", "git", "decentralized development"] },
  }),
});

export const forgejogGenerator = createStaticGenerator({
  name: "forgejo", flag: "forgejo", flagArg: "<user@instance>", description: "Forgejo community-owned Git forge",
  category: "code", platform: "forgejo", profileUrl: "https://codeberg.org/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "forgejo", url: `https://codeberg.org/${input}`, username: input }] } },
    faq: [{ question: "Do you use Forgejo?", answer: `Yes, I contribute to projects on Forgejo forges.`, category: "code" }],
    interests: { topics: ["forgejo", "community git", "free software", "federation"] },
  }),
});
