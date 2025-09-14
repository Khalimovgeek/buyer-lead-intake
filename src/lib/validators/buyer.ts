import { z } from "zod";

export const buyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/, "phone must be 10-15 digits"),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["One", "Two", "Three", "Four", "Studio"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.coerce.number().int().nonnegative().optional(),
  budgetMax: z.coerce.number().int().nonnegative().optional(),
  timeline: z.enum(["ThreeMonths", "SixMonths", "MoreThanSixMonths", "Exploring"]),
  source: z.enum(["Website", "Referral", "WalkIn", "Call", "Other"]),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  status: z
    .enum([
      "New",
      "Qualified",
      "Contacted",
      "Visited",
      "Negotiation",
      "Converted",
      "Dropped",
    ])
    .optional(),
}).superRefine((data, ctx) => {
  // require bhk only if residential
  if ((data.propertyType === "Apartment" || data.propertyType === "Villa") && !data.bhk) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "BHK is required for Apartment and Villa",
      path: ["bhk"],
    });
  }
  // budget logic
  if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
    if (data.budgetMax < data.budgetMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "budgetMax must be >= budgetMin",
        path: ["budgetMax"],
      });
    }
  }
});

export const csvHeaders = [
  "fullName",
  "email",
  "phone",
  "city",
  "propertyType",
  "bhk",
  "purpose",
  "budgetMin",
  "budgetMax",
  "timeline",
  "source",
  "notes",
  "tags",
  "status",
];
