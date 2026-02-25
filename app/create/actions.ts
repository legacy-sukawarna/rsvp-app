"use server"

import { put } from "@vercel/blob"

export async function uploadImage(formData: FormData) {
  const file = formData.get("image") as File

  if (!file || file.size === 0) {
    return { url: null }
  }

  try {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const baseName = file.name.replace(/\.[^/.]+$/, "")
    const uniqueFileName = `${baseName}-${timestamp}-${random}.${extension}`

    const blob = await put(uniqueFileName, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return { url: blob.url, error: null }
  } catch (error) {
    return { url: null, error: error instanceof Error ? error.message : "Failed to upload image" }
  }
}
