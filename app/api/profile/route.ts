import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/jwt";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getUserId(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("token")?.value ?? null;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    
    const token = cookieToken ?? bearerToken;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.id) return null;

    return payload.id;
  } catch {
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| GET -> FETCH PROFILE
|--------------------------------------------------------------------------
*/
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("display_name, email, phone, bio, profile_img")
      .eq("id", userId)
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/*
|--------------------------------------------------------------------------
| PUT -> UPDATE PROFILE
|--------------------------------------------------------------------------
*/
export async function PUT(req: NextRequest) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, bio, password, profile_img } = body;

    const updates: any = {};
    if (name !== undefined) updates.display_name = name.trim();
    if (email !== undefined) updates.email = email.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (profile_img !== undefined) updates.profile_img = profile_img;

    // Add password hashing here if you manage your own passwords
    if (password && password.trim().length > 0) {
      // updates.password = await bcrypt.hash(password, 10);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("display_name, email, phone, bio, profile_img")
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}