import { z } from "zod";

export const experienceSchema = z.object({
  title: z.string().describe("Job title"),
  company: z.string().describe("Company or organization name"),
  location: z.string().optional().describe("Work location"),
  start_date: z.string().describe("Start date (YYYY-MM or YYYY-MM-DD)"),
  end_date: z.string().optional().describe("End date, omit if current"),
  current: z.boolean().optional().default(false).describe("Whether this is the current position"),
  description: z.string().optional().describe("Role description"),
  highlights: z.array(z.string()).optional().describe("Key achievements or responsibilities"),
  technologies: z.array(z.string()).optional().describe("Technologies used in this role"),
});

export const educationSchema = z.object({
  institution: z.string().describe("School or university name"),
  degree: z.string().describe("Degree obtained or pursued"),
  field: z.string().optional().describe("Field of study"),
  start_date: z.string().describe("Start date (YYYY or YYYY-MM)"),
  end_date: z.string().optional().describe("End date, omit if ongoing"),
  current: z.boolean().optional().default(false),
  description: z.string().optional(),
  gpa: z.string().optional().describe("GPA or equivalent"),
});

export const certificationSchema = z.object({
  name: z.string().describe("Certification name"),
  issuer: z.string().describe("Issuing organization"),
  date: z.string().describe("Date obtained (YYYY-MM or YYYY-MM-DD)"),
  expiry: z.string().optional().describe("Expiration date"),
  url: z.string().url().optional().describe("Verification URL"),
  credential_id: z.string().optional(),
});

export const careerSchema = z.object({
  experience: z.array(experienceSchema).optional().describe("Work experience, most recent first"),
  education: z.array(educationSchema).optional().describe("Education history"),
  certifications: z.array(certificationSchema).optional().describe("Professional certifications"),
});

export type Career = z.infer<typeof careerSchema>;
