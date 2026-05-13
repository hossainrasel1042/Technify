import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/jwt";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function getUserId(req: NextRequest) {
  try {
    // 1. Read token from HttpOnly cookie first
    const cookieToken = req.cookies.get("token")?.value ?? null;

    // 2. Fallback to Authorization header
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    const token = cookieToken ?? bearerToken;

    if (!token) return null;

    // 3. Verify signature securely
    const payload = verifyToken(token);

    if (!payload || !payload.id) return null;

    if (!isUUID(payload.id)) return null;

    return payload.id;
  } catch {
    return null;
  }
}

function validate(data: any) {
  const { client_name, role_company, rating, review_text } = data;

  if (!client_name || !role_company || !rating || !review_text) {
    return "All fields are required";
  }

  if (typeof client_name !== "string" || client_name.trim().length < 2) {
    return "Invalid client name";
  }
  
  if (typeof role_company !== "string" || role_company.trim().length < 2) {
    return "Invalid role or company name";
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return "Invalid rating. Must be between 1 and 5";
  }

  if (typeof review_text !== "string" || review_text.trim().length < 5) {
    return "Review text is too short";
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| GET -> FETCH REVIEWS
|--------------------------------------------------------------------------
*/
export async function GET(req: NextRequest) {
  try {
    const user_id = getUserId(req);

    if (!user_id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Return the array of data directly to match the frontend expectations
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/*
|--------------------------------------------------------------------------
| POST -> ADD REVIEW
|--------------------------------------------------------------------------
*/
export async function POST(req: NextRequest) {
  try {
    const user_id = getUserId(req);

    if (!user_id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const errorMessage = validate(body);

    if (errorMessage) {
      return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
    }

    const { client_name, role_company, rating, review_text } = body;

    const { data, error } = await supabase
      .from("reviews")
      .insert([{
        user_id,
        client_name: client_name.trim(),
        role_company: role_company.trim(),
        rating: Number(rating),
        review_text: review_text.trim(),
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/*
|--------------------------------------------------------------------------
| PUT -> UPDATE REVIEW
|--------------------------------------------------------------------------
*/
export async function PUT(req: NextRequest) {
  try {
    const user_id = getUserId(req);

    if (!user_id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, client_name, role_company, rating, review_text } = body;

    if (!id || !isUUID(id)) {
      return NextResponse.json({ success: false, message: "Valid review id required" }, { status: 400 });
    }

    const errorMessage = validate(body);
    if (errorMessage) {
      return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({
        client_name: client_name.trim(),
        role_company: role_company.trim(),
        rating: Number(rating),
        review_text: review_text.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/*
|--------------------------------------------------------------------------
| DELETE -> DELETE REVIEW
|--------------------------------------------------------------------------
*/
export async function DELETE(req: NextRequest) {
  try {
    const user_id = getUserId(req);

    if (!user_id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Grabbing the ID from the URL search parameters to match the frontend fetch call
    const id = req.nextUrl.searchParams.get("id");

    if (!id || !isUUID(id)) {
      return NextResponse.json({ success: false, message: "Valid review id required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Review deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}