import { z } from 'zod';

export const vitalsSchema = z.object({
  bookNumber: z.string().min(1, "Book Number is required.").regex(/^[0-9]+$/, { message: "Book Number must contain only digits." }),
  
  bp: z.string().optional().or(z.literal('')).refine((val) => val === '' || /^\d+\/\d+$/.test(val), {
    message: "Invalid BP format. Use systolic/diastolic (e.g., 120/80).",
  }).refine((val) => {
    if (val === '' || val === undefined || val === null) return true;
    const [systolic, diastolic] = val.split('/').map(Number);
    return systolic >= 70 && systolic <= 250 && diastolic >= 40 && diastolic <= 150;
  }, {
    message: "BP values seem unrealistic. Please check the numbers.",
  }),

  pulse: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? undefined : val,
    z.coerce.number({invalid_type_error: "Pulse must be a number."}).int("Invalid Pulse: Please enter whole numbers only.").min(30, "Pulse seems too low.").max(220, "Pulse seems too high.").optional()
  ),

  rbs: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? undefined : val,
    z.coerce.number({invalid_type_error: "RBS must be a number."}).int("Invalid RBS: Please enter whole numbers only.").min(20, "RBS seems too low.").max(1000, "RBS seems too high.").optional()
  ),

  weight: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? undefined : val,
    z.coerce.number({invalid_type_error: "Invalid Weight: Please enter a valid number (e.g., 60 or 60.5)."}).min(1, "Weight seems too low.").max(500, "Weight seems too high.").optional()
  ),

  height: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? undefined : val,
    z.coerce.number({invalid_type_error: "Invalid Height: Please enter a valid number (e.g., 170 or 170.2)."}).min(50, "Height seems too low.").max(275, "Height seems too high.").optional()
  ),

  extra_note: z.string().optional(),
});
