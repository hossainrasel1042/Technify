import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let display_name = "";
    let email = "";
    let phone = "";
    let bio = "";
    let password = "";
    let profileImgBuffer: Buffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      display_name = (formData.get("display_name") as string)?.trim() ?? "";
      email        = (formData.get("email")        as string)?.trim() ?? "";
      phone        = (formData.get("phone")        as string)?.trim() ?? "";
      bio          = (formData.get("bio")          as string)?.trim() ?? "";
      password     = (formData.get("password")     as string)?.trim() ?? "";

      const imgFile = formData.get("profile_img") as File | null;
      if (imgFile && imgFile.size > 0) {
        const arrayBuffer = await imgFile.arrayBuffer();
        profileImgBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      const body = await req.json();
      display_name = body.display_name?.trim() ?? "";
      email        = body.email?.trim()        ?? "";
      phone        = body.phone?.trim()        ?? "";
      bio          = body.bio?.trim()          ?? "";
      password     = body.password?.trim()     ?? "";
    }

    if (!display_name || !email || !phone || !bio || !password) {
      return NextResponse.json(
        { message: "Display name, email, and password are required." },
        { status: 400 }
      );
    }
    if (!profileImgBuffer) {
  return NextResponse.json(
    { message: "Profile image is required." },
    { status: 400 }
  );
}

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const storedHash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        display_name,
        email,
        phone:       phone || null,
        bio:         bio   || null,
        profile_img: profileImgBuffer ?? null,
        password:    storedHash,
      })
      .select("id") // UUID only
      .single();

    if (error || !user) {
      console.error("[register] Supabase insert error:", error);
      return NextResponse.json(
        { message: "Registration failed. Please try again." },
        { status: 500 }
      );
    }

    // Sign token with UUID only
    const token = signToken(user.id);

    const response = NextResponse.json({ token }, { status: 201 });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (err) {
    console.error("[register] Unexpected error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}