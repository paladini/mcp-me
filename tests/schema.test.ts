import { describe, it, expect } from "vitest";
import {
  identitySchema,
  careerSchema,
  skillsSchema,
  interestsSchema,
  personalitySchema,
  goalsSchema,
  projectsSchema,
  faqSchema,
  PROFILE_CATEGORIES,
  profileSchemaMap,
} from "../src/schema/index.js";

describe("identitySchema", () => {
  it("validates a minimal identity", () => {
    const result = identitySchema.safeParse({
      name: "John Doe",
      bio: "A software engineer.",
    });
    expect(result.success).toBe(true);
  });

  it("validates a full identity", () => {
    const result = identitySchema.safeParse({
      name: "John Doe",
      nickname: "JD",
      pronouns: "he/him",
      bio: "A software engineer.",
      bio_extended: "A passionate software engineer with 10 years of experience.",
      photo_url: "https://example.com/photo.jpg",
      location: {
        city: "San Francisco",
        state: "California",
        country: "United States",
        timezone: "America/Los_Angeles",
      },
      languages: [
        { language: "English", proficiency: "native" },
        { language: "Portuguese", proficiency: "fluent" },
      ],
      contact: {
        email: "john@example.com",
        website: "https://johndoe.com",
        social: [
          { platform: "github", url: "https://github.com/johndoe", username: "johndoe" },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = identitySchema.safeParse({ name: "John" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = identitySchema.safeParse({
      name: "John",
      bio: "Test",
      contact: { email: "not-an-email" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid proficiency", () => {
    const result = identitySchema.safeParse({
      name: "John",
      bio: "Test",
      languages: [{ language: "English", proficiency: "super-fluent" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("careerSchema", () => {
  it("validates career with experience", () => {
    const result = careerSchema.safeParse({
      experience: [
        {
          title: "Software Engineer",
          company: "Acme Corp",
          start_date: "2022-01",
          current: true,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("validates career with education and certifications", () => {
    const result = careerSchema.safeParse({
      education: [
        {
          institution: "MIT",
          degree: "B.S.",
          start_date: "2018",
        },
      ],
      certifications: [
        {
          name: "AWS Solutions Architect",
          issuer: "Amazon",
          date: "2023-06",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty career", () => {
    const result = careerSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("skillsSchema", () => {
  it("validates skills", () => {
    const result = skillsSchema.safeParse({
      technical: [{ name: "TypeScript", proficiency: "advanced", years: 5 }],
      soft: [{ name: "Communication" }],
      languages: [{ name: "Python", proficiency: "intermediate" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid proficiency", () => {
    const result = skillsSchema.safeParse({
      technical: [{ name: "TypeScript", proficiency: "god-tier" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("interestsSchema", () => {
  it("validates interests", () => {
    const result = interestsSchema.safeParse({
      hobbies: ["Reading", "Hiking"],
      music: { genres: ["Rock"], artists: [{ name: "Radiohead", favorite: true }] },
      books: { genres: ["Sci-Fi"], currently_reading: [{ name: "Dune" }] },
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty interests", () => {
    const result = interestsSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("personalitySchema", () => {
  it("validates personality", () => {
    const result = personalitySchema.safeParse({
      traits: ["Curious", "Analytical"],
      values: ["Honesty"],
      mbti: "INTJ",
      work_style: { preference: "remote" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid work preference", () => {
    const result = personalitySchema.safeParse({
      work_style: { preference: "underwater" },
    });
    expect(result.success).toBe(false);
  });
});

describe("goalsSchema", () => {
  it("validates goals", () => {
    const result = goalsSchema.safeParse({
      short_term: [{ title: "Learn Rust", status: "in_progress" }],
      long_term: [{ title: "Write a book" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("projectsSchema", () => {
  it("validates projects", () => {
    const result = projectsSchema.safeParse({
      projects: [
        {
          name: "mcp-me",
          description: "Personal MCP server framework",
          status: "active",
          technologies: ["TypeScript"],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = projectsSchema.safeParse({
      projects: [{ name: "test" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("faqSchema", () => {
  it("validates FAQ items", () => {
    const result = faqSchema.safeParse({
      items: [
        {
          question: "What do you do?",
          answer: "I'm a software engineer.",
          category: "general",
          tags: ["work"],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects items without question", () => {
    const result = faqSchema.safeParse({
      items: [{ answer: "Something" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("PROFILE_CATEGORIES", () => {
  it("contains all 8 categories", () => {
    expect(PROFILE_CATEGORIES).toHaveLength(8);
    expect(PROFILE_CATEGORIES).toContain("identity");
    expect(PROFILE_CATEGORIES).toContain("career");
    expect(PROFILE_CATEGORIES).toContain("skills");
    expect(PROFILE_CATEGORIES).toContain("interests");
    expect(PROFILE_CATEGORIES).toContain("personality");
    expect(PROFILE_CATEGORIES).toContain("goals");
    expect(PROFILE_CATEGORIES).toContain("projects");
    expect(PROFILE_CATEGORIES).toContain("faq");
  });

  it("has a schema for each category", () => {
    for (const category of PROFILE_CATEGORIES) {
      expect(profileSchemaMap[category]).toBeDefined();
    }
  });
});
