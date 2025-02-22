"use client";

import Link from "next/link";
import { useState } from "react";
import {
  PencilIcon,
  AtSymbolIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { useActionState } from "react";
import { createCustomer, State } from "@/app/lib/CustomersActions";

export default function Form() {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createCustomer, initialState);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  console.log(state);

  return (
    <form action={formAction}>
      <div className="flex flex-col items-center">
        {/* Image Preview */}
        <label htmlFor="image-upload" className="relative cursor-pointer">
          <div className="h-24 w-24 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <CameraIcon className="h-10 w-10 text-gray-500" />
            )}
          </div>
          <input
            id="image-upload"
            name="image"
            type="file"
            accept="image/png"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        {/* Error Message for Image */}
        {state.errors?.image && (
          <p className="mt-2 text-sm text-red-500">{state.errors.image[0]}</p>
        )}
      </div>

      <div className="rounded-md bg-gray-50 p-4 md:p-6 mt-4">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Choose a full name
          </label>
          <div className="relative mt-2 rounded-md">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter full name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          {state.errors?.name && (
            <p className="mt-2 text-sm text-red-500">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Customer Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Choose an email
          </label>
          <div className="relative mt-2 rounded-md">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter the email"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          {state.errors?.email && (
            <p className="mt-2 text-sm text-red-500">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Form Error Messages */}
        {state.message && (
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Customer</Button>
      </div>
    </form>
  );
}
