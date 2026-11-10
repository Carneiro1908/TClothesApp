import { z } from 'zod';

export const ProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less')
    .trim(),
  category: z.enum(['tshirts', 'hoodies', 'windbreakers', 'pants'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .trim()
    .optional()
    .nullable(),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .max(99999, 'Price seems too high'),
  image_url: z
    .string()
    .refine((value) => value.startsWith('/api/uploads/') || z.string().url().safeParse(value).success, 'Must be a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  image_urls: z.array(z.string().min(1)).optional(),
  status: z.enum(['active', 'coming_soon', 'hidden'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export const LoginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(100)
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(200),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ProductUpdateSchema = ProductSchema.partial().extend({
  name: z.string().min(1).max(200).trim().optional(),
  category: z
    .enum(['tshirts', 'hoodies', 'windbreakers', 'pants'])
    .optional(),
  price: z.number().positive().max(99999).optional(),
  status: z.enum(['active', 'coming_soon', 'hidden']).optional(),
});

export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
