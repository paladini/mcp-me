/**
 * Finance, Crypto & Web3 Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const etherscanGenerator = createGenerator({
  name: "etherscan", flag: "etherscan", flagArg: "<wallet-address>", description: "Etherscan Ethereum wallet activity",
  category: "crypto", platform: "etherscan", profileUrl: "https://etherscan.io/address/{input}",
  apiUrl: "https://api.etherscan.io/api?module=account&action=balance&address={input}&tag=latest",
  extract: (data: unknown, input) => {
    const d = data as { result?: string };
    const ethBalance = d.result ? (parseInt(d.result, 10) / 1e18).toFixed(4) : "0";
    return { stats: `My Ethereum wallet (${input.slice(0, 8)}...) has ${ethBalance} ETH.`, topics: ["ethereum", "web3", "cryptocurrency"], hobbies: ["crypto"] };
  },
});

export const ensGenerator = createStaticGenerator({
  name: "ens", flag: "ens", flagArg: "<name.eth>", description: "ENS (Ethereum Name Service) domain",
  category: "crypto", platform: "ens", profileUrl: "https://app.ens.domains/name/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "ens", url: `https://app.ens.domains/name/${input}`, username: input }], website: `https://${input}.limo` } },
    faq: [{ question: "Do you have an ENS name?", answer: `Yes, my ENS name is ${input}`, category: "crypto" }],
    interests: { topics: ["ens", "ethereum", "web3 identity", "decentralized naming"] },
  }),
});

export const openseaGenerator = createGenerator({
  name: "opensea", flag: "opensea", flagArg: "<wallet-or-username>", description: "OpenSea NFT collection",
  category: "crypto", platform: "opensea", profileUrl: "https://opensea.io/{input}",
  apiUrl: "https://api.opensea.io/api/v2/accounts/{input}",
  extract: (data: unknown) => {
    const d = data as { username?: string; bio?: string; website?: string };
    return { displayName: d.username, bio: d.bio, website: d.website, topics: ["nft", "digital art", "web3"], hobbies: ["nft collecting"] };
  },
});

export const mirrorGenerator = createStaticGenerator({
  name: "mirror", flag: "mirror", flagArg: "<address-or-ens>", description: "Mirror.xyz web3 writing",
  category: "crypto", platform: "mirror", profileUrl: "https://mirror.xyz/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "mirror", url: `https://mirror.xyz/${input}`, username: input }] } },
    faq: [{ question: "Do you write on Mirror?", answer: `Yes, I publish on Mirror.xyz (web3 publishing platform).`, category: "crypto" }],
    interests: { hobbies: ["web3 writing"], topics: ["mirror.xyz", "web3 publishing", "decentralized content"] },
  }),
});

export const farcasterGenerator = createGenerator({
  name: "farcaster", flag: "farcaster", description: "Farcaster decentralized social profile",
  category: "crypto", platform: "farcaster", profileUrl: "https://warpcast.com/{input}",
  apiUrl: "https://api.neynar.com/v2/farcaster/user/by_username?username={input}",
  extract: (data: unknown) => {
    const d = data as { user?: { display_name?: string; profile?: { bio?: { text?: string } }; follower_count?: number; following_count?: number } };
    const u = d.user;
    return { displayName: u?.display_name, bio: u?.profile?.bio?.text, stats: `I have ${u?.follower_count ?? 0} followers on Farcaster.`, topics: ["farcaster", "warpcast", "web3 social", "decentralized social"] };
  },
});

export const lensGenerator = createStaticGenerator({
  name: "lens", flag: "lens", flagArg: "<handle.lens>", description: "Lens Protocol web3 social profile",
  category: "crypto", platform: "lens", profileUrl: "https://hey.xyz/u/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "lens", url: `https://hey.xyz/u/${input}`, username: input }] } },
    faq: [{ question: "Are you on Lens Protocol?", answer: `Yes, my Lens handle is ${input}`, category: "crypto" }],
    interests: { topics: ["lens protocol", "web3 social", "decentralized social media"] },
  }),
});

export const gitcoinGenerator = createStaticGenerator({
  name: "gitcoin", flag: "gitcoin", flagArg: "<address-or-handle>", description: "Gitcoin grants and contributions",
  category: "crypto", platform: "gitcoin", profileUrl: "https://gitcoin.co/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "gitcoin", url: `https://gitcoin.co/${input}`, username: input }] } },
    faq: [{ question: "Do you contribute to public goods?", answer: `Yes, I support open source through Gitcoin grants.`, category: "crypto" }],
    interests: { topics: ["gitcoin", "public goods funding", "quadratic funding", "open source funding"] },
  }),
});

export const debankGenerator = createStaticGenerator({
  name: "debank", flag: "debank", flagArg: "<wallet-address>", description: "DeBank DeFi portfolio overview",
  category: "crypto", platform: "debank", profileUrl: "https://debank.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "debank", url: `https://debank.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Are you into DeFi?", answer: `Yes, you can see my DeFi portfolio on DeBank.`, category: "crypto" }],
    interests: { topics: ["defi", "decentralized finance", "yield farming", "liquidity"] },
  }),
});

export const zoraGenerator = createStaticGenerator({
  name: "zora", flag: "zora", flagArg: "<address-or-ens>", description: "Zora NFT minting platform",
  category: "crypto", platform: "zora", profileUrl: "https://zora.co/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "zora", url: `https://zora.co/${input}`, username: input }] } },
    faq: [{ question: "Do you mint NFTs?", answer: `Yes, I create and collect on Zora.`, category: "crypto" }],
    interests: { topics: ["zora", "nft minting", "digital art", "onchain art"] },
  }),
});

export const tradingviewGenerator = createStaticGenerator({
  name: "tradingview", flag: "tradingview", description: "TradingView charts and ideas",
  category: "finance", platform: "tradingview", profileUrl: "https://www.tradingview.com/u/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "tradingview", url: `https://www.tradingview.com/u/${input}`, username: input }] } },
    faq: [{ question: "Do you trade?", answer: `Yes, I share trading ideas and charts on TradingView.`, category: "finance" }],
    interests: { hobbies: ["trading", "technical analysis"], topics: ["stocks", "forex", "crypto trading", "technical analysis"] },
  }),
});

export const stocktwitsGenerator = createStaticGenerator({
  name: "stocktwits", flag: "stocktwits", description: "StockTwits stock market discussion",
  category: "finance", platform: "stocktwits", profileUrl: "https://stocktwits.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "stocktwits", url: `https://stocktwits.com/${input}`, username: input }] } },
    faq: [{ question: "Do you discuss stocks?", answer: `Yes, I share stock market insights on StockTwits.`, category: "finance" }],
    interests: { hobbies: ["investing"], topics: ["stock market", "investing", "trading"] },
  }),
});

export const seekingalphaGenerator = createStaticGenerator({
  name: "seekingalpha", flag: "seekingalpha", flagArg: "<author-id>", description: "Seeking Alpha investment analysis",
  category: "finance", platform: "seekingalpha", profileUrl: "https://seekingalpha.com/author/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "seekingalpha", url: `https://seekingalpha.com/author/${input}`, username: input }] } },
    faq: [{ question: "Do you write investment analysis?", answer: `Yes, I publish investment analysis on Seeking Alpha.`, category: "finance" }],
    interests: { hobbies: ["investing", "financial analysis"], topics: ["value investing", "stock analysis", "dividends"] },
  }),
});

export const kofiGenerator = createStaticGenerator({
  name: "kofi", flag: "kofi", description: "Ko-fi creator support page",
  category: "finance", platform: "kofi", profileUrl: "https://ko-fi.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "kofi", url: `https://ko-fi.com/${input}`, username: input }], website: `https://ko-fi.com/${input}` } },
    faq: [{ question: "Can I support your work?", answer: `Yes! Support me on Ko-fi: ko-fi.com/${input}`, category: "social" }],
    interests: { topics: ["creator economy", "patronage"] },
  }),
});

export const patreonGenerator = createStaticGenerator({
  name: "patreon", flag: "patreon", description: "Patreon creator page",
  category: "finance", platform: "patreon", profileUrl: "https://www.patreon.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "patreon", url: `https://www.patreon.com/${input}`, username: input }], website: `https://www.patreon.com/${input}` } },
    faq: [{ question: "Are you on Patreon?", answer: `Yes! Support my work on Patreon: patreon.com/${input}`, category: "social" }],
    interests: { topics: ["patreon", "creator economy", "membership"] },
  }),
});

export const gumroadGenerator = createStaticGenerator({
  name: "gumroad", flag: "gumroad", description: "Gumroad digital products",
  category: "finance", platform: "gumroad", profileUrl: "https://{input}.gumroad.com",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "gumroad", url: `https://${input}.gumroad.com`, username: input }], website: `https://${input}.gumroad.com` } },
    faq: [{ question: "Do you sell digital products?", answer: `Yes, check out my products on Gumroad: ${input}.gumroad.com`, category: "finance" }],
    interests: { topics: ["digital products", "creator economy", "indie business"] },
  }),
});

export const lemonSqueezyGenerator = createStaticGenerator({
  name: "lemonsqueezy", flag: "lemonsqueezy", description: "Lemon Squeezy digital store",
  category: "finance", platform: "lemonsqueezy", profileUrl: "https://{input}.lemonsqueezy.com",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "lemonsqueezy", url: `https://${input}.lemonsqueezy.com`, username: input }] } },
    faq: [{ question: "Do you sell software/digital products?", answer: `Yes, find my products at ${input}.lemonsqueezy.com`, category: "finance" }],
    interests: { topics: ["saas", "digital products", "indie hacker"] },
  }),
});

export const indieHackersGenerator = createStaticGenerator({
  name: "indiehackers", flag: "indiehackers", description: "Indie Hackers maker profile",
  category: "finance", platform: "indiehackers", profileUrl: "https://www.indiehackers.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "indiehackers", url: `https://www.indiehackers.com/${input}`, username: input }] } },
    faq: [{ question: "Are you an indie hacker?", answer: `Yes, I'm building products independently. Find me on Indie Hackers.`, category: "finance" }],
    interests: { hobbies: ["indie hacking", "bootstrapping"], topics: ["indie hackers", "bootstrapping", "saas", "micro-saas"] },
  }),
});

export const microacquireGenerator = createStaticGenerator({
  name: "acquire", flag: "acquire", description: "Acquire.com startup profile",
  category: "finance", platform: "acquire", profileUrl: "https://acquire.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "acquire", url: "https://acquire.com/", username: input }] } },
    faq: [{ question: "Have you acquired or sold startups?", answer: `Yes, I'm active on the Acquire.com marketplace.`, category: "finance" }],
    interests: { topics: ["startup acquisition", "micro acquisitions", "entrepreneurship"] },
  }),
});

export const pioneerGenerator = createStaticGenerator({
  name: "pioneer", flag: "pioneer", flagArg: "<username>", description: "Pioneer.app startup tournament",
  category: "finance", platform: "pioneer", profileUrl: "https://pioneer.app/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "pioneer", url: `https://pioneer.app/${input}`, username: input }] } },
    faq: [{ question: "Are you on Pioneer?", answer: `Yes, I compete in the Pioneer startup tournament.`, category: "finance" }],
    interests: { hobbies: ["startup building"], topics: ["startup", "entrepreneurship", "pioneer tournament"] },
  }),
});
