"use server"

import { put } from "@vercel/blob"

export async function uploadImage(formData: FormData) {
  const file = formData.get("image") as File

  if (!file || file.size === 0) {
    return { url: null }
  }

  try {
    const blob = await put(file.name, file, {
      access: "public",
    })

    return { url: blob.url, error: null }
  } catch (error) {
    return { url: null, error: error instanceof Error ? error.message : "Failed to upload image" }
  }
}
