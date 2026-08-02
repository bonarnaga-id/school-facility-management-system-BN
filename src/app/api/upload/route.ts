import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL atau Service Role Key tidak dikonfigurasi");
  }
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "pemeliharaan";

    if (!file) {
      return NextResponse.json({ error: "File wajib diunggah" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from("foto-bukti")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("[UPLOAD] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage
      .from("foto-bukti")
      .getPublicUrl(fileName);

    return NextResponse.json({ path: data.path, url: publicUrl.publicUrl });
  } catch (e: any) {
    console.error("[UPLOAD] error:", e);
    return NextResponse.json({ error: e?.message || "Gagal upload foto" }, { status: 500 });
  }
}
