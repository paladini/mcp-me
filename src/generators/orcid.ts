import type { GeneratorSource, PartialProfile } from "./types.js";

interface ORCIDPerson {
  name?: { "given-names"?: { value: string }; "family-name"?: { value: string } };
  biography?: { content: string };
  "researcher-urls"?: { "researcher-url": { url: { value: string }; "url-name": string }[] };
}

interface ORCIDWork {
  "work-summary": {
    title: { title: { value: string } };
    "publication-date"?: { year?: { value: string } };
    type: string;
    "external-ids"?: { "external-id": { "external-id-type": string; "external-id-value": string; "external-id-url"?: { value: string } }[] };
  }[];
}

export const orcidGenerator: GeneratorSource = {
  name: "orcid",
  flag: "orcid",
  flagArg: "<orcid-id>",
  description: "ORCID academic publications, affiliations",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const orcidId = config.username as string;
    if (!orcidId) throw new Error("ORCID ID is required (e.g. 0000-0002-1234-5678)");

    console.log(`  [ORCID] Fetching profile for ${orcidId}...`);
    const personResp = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/person`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!personResp.ok) throw new Error(`ORCID API error: ${personResp.status}`);
    const person = (await personResp.json()) as ORCIDPerson;

    console.log(`  [ORCID] Fetching works...`);
    const worksResp = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    const worksData = (await worksResp.json()) as { group: ORCIDWork[] };
    const works = worksData.group ?? [];
    console.log(`  [ORCID] Found ${works.length} works.`);

    const givenName = person.name?.["given-names"]?.value ?? "";
    const familyName = person.name?.["family-name"]?.value ?? "";
    const fullName = `${givenName} ${familyName}`.trim();

    const projects = works.slice(0, 20).map((w) => {
      const summary = w["work-summary"][0];
      const doi = summary["external-ids"]?.["external-id"]?.find((e) => e["external-id-type"] === "doi");
      return {
        name: summary.title.title.value,
        description: `${summary.type} (${summary["publication-date"]?.year?.value ?? "unknown"})`,
        url: doi?.["external-id-url"]?.value ?? `https://orcid.org/${orcidId}`,
        status: "completed" as const,
        start_date: summary["publication-date"]?.year?.value,
        category: "publication",
      };
    });

    const identity: PartialProfile["identity"] = {
      ...(fullName ? { name: fullName } : {}),
      ...(person.biography?.content ? { bio: person.biography.content } : {}),
      contact: {
        social: [{ platform: "orcid", url: `https://orcid.org/${orcidId}`, username: orcidId }],
      },
    };

    const urls = person["researcher-urls"]?.["researcher-url"] ?? [];
    if (urls.length > 0 && identity.contact) {
      for (const u of urls) {
        identity.contact.social!.push({ platform: u["url-name"] || "website", url: u.url.value });
      }
    }

    const faq: PartialProfile["faq"] = works.length > 0
      ? [{
          question: "Do you have academic publications?",
          answer: `Yes, ${works.length} work(s) listed on ORCID. Recent: ${works.slice(0, 3).map((w) => w["work-summary"][0].title.title.value).join("; ")}.`,
          category: "academic",
        }]
      : [];

    return { identity, projects, faq };
  },
};
