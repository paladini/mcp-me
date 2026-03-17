export { identitySchema, socialLinkSchema, type Identity } from "./identity.js";
export { careerSchema, experienceSchema, educationSchema, certificationSchema, type Career } from "./career.js";
export { skillsSchema, skillSchema, type Skills } from "./skills.js";
export { interestsSchema, interestItemSchema, type Interests } from "./interests.js";
export { personalitySchema, type Personality } from "./personality.js";
export { goalsSchema, goalSchema, type Goals } from "./goals.js";
export { projectsSchema, projectSchema, type Projects } from "./projects.js";
export { faqSchema, faqItemSchema, type Faq } from "./faq.js";

import { identitySchema } from "./identity.js";
import { careerSchema } from "./career.js";
import { skillsSchema } from "./skills.js";
import { interestsSchema } from "./interests.js";
import { personalitySchema } from "./personality.js";
import { goalsSchema } from "./goals.js";
import { projectsSchema } from "./projects.js";
import { faqSchema } from "./faq.js";
import { z } from "zod";

export const PROFILE_CATEGORIES = [
  "identity",
  "career",
  "skills",
  "interests",
  "personality",
  "goals",
  "projects",
  "faq",
] as const;

export type ProfileCategory = (typeof PROFILE_CATEGORIES)[number];

export const profileSchemaMap: Record<ProfileCategory, z.ZodType> = {
  identity: identitySchema,
  career: careerSchema,
  skills: skillsSchema,
  interests: interestsSchema,
  personality: personalitySchema,
  goals: goalsSchema,
  projects: projectsSchema,
  faq: faqSchema,
};
