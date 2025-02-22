"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";

const sql = postgres(process.env.POSTGRES_URL!);

const FormSchema = z.object({
  id: z.string(),
  name: z
    .string({
      invalid_type_error: "Please select a full name.",
    })
    .min(1, "Please enter a full name."),
  email: z
    .string({
      invalid_type_error: "Please select an email address.",
    })
    .email({
      message: "Please enter a valid email address.",
    }),
  image: z.string({
    invalid_type_error: "Please select an image URL.",
  }),
});

const CreateCustomer = FormSchema.omit({ id: true });
const UpdateCustomer = FormSchema.omit({ id: true });

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    image?: string[];
  };
  message?: string | null;
};

export async function createCustomer(prevState: State, formData: FormData) {
  const file = formData.get("image") as File | null;
  let imageFilename = null;

  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split(".").pop() || ".png";

    const uniqueFilename = `${formData.get("name")}-${Date.now()}.${ext}`
      .toLowerCase()
      .replace(" ", "-");

    const uploadPath = path.join(
      process.cwd(),
      "public/customers",
      uniqueFilename
    );

    // Save the file
    fs.writeFileSync(uploadPath, buffer);
    imageFilename = "/customers/" + uniqueFilename;
  }

  const validatedFields = CreateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    image: imageFilename, // Store only filename
  });

  console.log(validatedFields);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Customer.",
    };
  }

  const { name, email } = validatedFields.data;

  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${imageFilename})
    `;
  } catch {
    return { message: "Database Error: Failed to Create Customer." };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function updateCustomer(
  id: string,
  prevState: State,
  formData: FormData
) {
  console.log(formData);
  const existingImage = formData.get("existingImage") as string;
  const file = formData.get("image") as File | null;

  let imageFilename = existingImage; // Default to current image

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();
    const uniqueFilename = `${formData.get("name")}-${Date.now()}.${ext}`
      .toLowerCase()
      .replace(" ", "-");

    const uploadPath = path.join(
      process.cwd(),
      "public/customers",
      uniqueFilename
    );

    // Save the file
    fs.writeFileSync(uploadPath, buffer);
    imageFilename = "/customers/" + uniqueFilename;
  }

  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    image: imageFilename, // Store only filename
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Customer.",
    };
  }

  const { name, email } = validatedFields.data;

  try {
    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}, image_url = ${imageFilename}
      WHERE id = ${id}
    `;
  } catch {
    return { message: "Database Error: Failed to Update Customer." };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function deleteCustomer(id: string) {
  await sql`DELETE FROM customers WHERE id = ${id}`;
  revalidatePath("/dashboard/Customers");
}
