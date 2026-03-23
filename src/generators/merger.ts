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

  // For name: first non-empty wins
  target.identity.name = target.identity.name || source.identity.name;

  // For bio: prefer the longer/richer one
  if (source.identity.bio) {
    if (!target.identity.bio || source.identity.bio.length > target.identity.bio.length) {
      target.identity.bio = source.identity.bio;
    }
  }

  // Merge location fields individually instead of replacing the whole object
  if (source.identity.location) {
    if (!target.identity.location) {
      target.identity.location = source.identity.location;
    } else {
      target.identity.location.city = target.identity.location.city || source.identity.location.city;
      target.identity.location.country = target.identity.location.country || source.identity.location.country;
    }
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

  // Deduplicate by name; if a project already exists, prefer the richer description.
  const existingIndex = new Map(target.projects.map((p, i) => [p.name.toLowerCase(), i]));
  for (const project of source.projects) {
    const key = project.name.toLowerCase();
    const idx = existingIndex.get(key);
    if (idx === undefined) {
      target.projects.push(project);
      existingIndex.set(key, target.projects.length - 1);
    } else {
      // Update description if the incoming one is richer (longer)
      const existing = target.projects[idx];
      if (
        existing &&
        project.description &&
        (project.description.length > (existing.description?.length ?? 0))
      ) {
        target.projects[idx] = { ...existing, description: project.description };
      }
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
