import type { PartialProfile } from "./types.js";

/**
 * Deep-merge multiple PartialProfile objects into one unified profile.
 * Arrays are concatenated and deduplicated by name. Objects are merged.
 */
export function mergeProfiles(profiles: PartialProfile[]): PartialProfile {
  const merged: PartialProfile = {};

  for (const p of profiles) {
    mergeIdentity(merged, p);
    mergeSkills(merged, p);
    mergeProjects(merged, p);
    mergeCareer(merged, p);
    mergeInterests(merged, p);
    mergeFaq(merged, p);
    mergePlugins(merged, p);
  }

  return merged;
}

function mergeIdentity(target: PartialProfile, source: PartialProfile): void {
  if (!source.identity) return;

  if (!target.identity) {
    target.identity = { contact: {} };
  }

  // First non-empty wins for scalar fields
  target.identity.name = target.identity.name || source.identity.name;
  target.identity.bio = target.identity.bio || source.identity.bio;

  if (source.identity.location && !target.identity.location) {
    target.identity.location = source.identity.location;
  }

  // Merge contact
  if (source.identity.contact) {
    if (!target.identity.contact) target.identity.contact = {};
    const tc = target.identity.contact;
    const sc = source.identity.contact;

    tc.email = tc.email || sc.email;
    tc.website = tc.website || sc.website;

    // Deduplicate social by platform
    if (sc.social?.length) {
      if (!tc.social) tc.social = [];
      const existingPlatforms = new Set(tc.social.map((s) => s.platform));
      for (const social of sc.social) {
        if (!existingPlatforms.has(social.platform)) {
          tc.social.push(social);
          existingPlatforms.add(social.platform);
        }
      }
    }
  }
}

function mergeSkills(target: PartialProfile, source: PartialProfile): void {
  if (!source.skills) return;

  if (!target.skills) {
    target.skills = {};
  }

  // Merge languages — deduplicate by name
  if (source.skills.languages?.length) {
    target.skills.languages = deduplicateByName(
      [...(target.skills.languages ?? []), ...source.skills.languages],
    );
  }

  // Merge technical skills — deduplicate by name
  if (source.skills.technical?.length) {
    target.skills.technical = deduplicateByName(
      [...(target.skills.technical ?? []), ...source.skills.technical],
    );
  }

  // Merge tools — deduplicate by name
  if (source.skills.tools?.length) {
    target.skills.tools = deduplicateByName(
      [...(target.skills.tools ?? []), ...source.skills.tools],
    );
  }
}

function mergeProjects(target: PartialProfile, source: PartialProfile): void {
  if (!source.projects?.length) return;

  if (!target.projects) {
    target.projects = [];
  }

  // Deduplicate by name
  const existingNames = new Set(target.projects.map((p) => p.name.toLowerCase()));
  for (const project of source.projects) {
    if (!existingNames.has(project.name.toLowerCase())) {
      target.projects.push(project);
      existingNames.add(project.name.toLowerCase());
    }
  }
}

function mergeCareer(target: PartialProfile, source: PartialProfile): void {
  if (!source.career?.experience?.length) return;

  if (!target.career) target.career = {};
  if (!target.career.experience) target.career.experience = [];

  const existingCompanies = new Set(
    target.career.experience.map((e) => e.company.toLowerCase()),
  );
  for (const exp of source.career.experience) {
    if (!existingCompanies.has(exp.company.toLowerCase())) {
      target.career.experience.push(exp);
      existingCompanies.add(exp.company.toLowerCase());
    }
  }
}

function mergeInterests(target: PartialProfile, source: PartialProfile): void {
  if (!source.interests) return;

  if (!target.interests) target.interests = {};

  if (source.interests.hobbies?.length) {
    const existing = new Set(target.interests.hobbies ?? []);
    target.interests.hobbies = [
      ...(target.interests.hobbies ?? []),
      ...source.interests.hobbies.filter((h) => !existing.has(h)),
    ];
  }

  if (source.interests.topics?.length) {
    const existing = new Set(target.interests.topics ?? []);
    target.interests.topics = [
      ...(target.interests.topics ?? []),
      ...source.interests.topics.filter((t) => !existing.has(t)),
    ];
  }
}

function mergeFaq(target: PartialProfile, source: PartialProfile): void {
  if (!source.faq?.length) return;

  if (!target.faq) target.faq = [];

  const existingQuestions = new Set(target.faq.map((f) => f.question.toLowerCase()));
  for (const item of source.faq) {
    if (!existingQuestions.has(item.question.toLowerCase())) {
      target.faq.push(item);
      existingQuestions.add(item.question.toLowerCase());
    }
  }
}

function mergePlugins(target: PartialProfile, source: PartialProfile): void {
  if (!source.plugins) return;

  if (!target.plugins) target.plugins = {};
  Object.assign(target.plugins, source.plugins);
}

function deduplicateByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
