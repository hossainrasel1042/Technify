import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/jwt"; // <-- FIX 1: Using your central JWT lib

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_STATUS = [
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

// <-- FIX 2, 3 & 4: Secure verification & cookie fallback
function getUserId(req: NextRequest) {
  try {
    // 1. Read token from HttpOnly cookie first (mirrors proxy.ts)
    const cookieToken = req.cookies.get("token")?.value ?? null;

    // 2. Fallback to Authorization header
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    const token = cookieToken ?? bearerToken;

    if (!token) return null;

    // 3. Verify signature securely rather than just decoding
    const payload = verifyToken(token);

    if (!payload || !payload.id) return null;

    if (!isUUID(payload.id)) return null;

    return payload.id;
  } catch {
    return null;
  }
}

function validate(data: any) {
  const { title, client_name, project_url, status, description, company_logo } = data;

  if (!title || !client_name || !project_url || !status || !description || !company_logo) {
    return "All fields are required";
  }

  if (typeof title !== "string" || title.trim().length < 2) return "Invalid title";
  
  if (typeof client_name !== "string" || client_name.trim().length < 2) return "Invalid client name";

  try {
    new URL(project_url);
  } catch {
    return "Invalid project URL";
  }

  if (!VALID_STATUS.includes(status)) return "Invalid status";

  if (typeof description !== "string" || description.trim().length < 10) return "Description too short";

  if (typeof company_logo !== "string") return "Invalid company logo";

  return null;
}

/*
|--------------------------------------------------------------------------
| GET -> FETCH PROJECTS
|--------------------------------------------------------------------------
*/
export async function GET(req: NextRequest) {
  try {
    const user_id = getUserId(req);

    if (!user_id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

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
| POST -> ADD PROJECT
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

    const { title, client_name, project_url, status, description, company_logo } = body;

    const { data, error } = await supabase
      .from("projects")
      .insert([{
        user_id,
        title: title.trim(),
        client_name: client_name.trim(),
        project_url,
        status,
        description: description.trim(),
        company_logo,
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
| PUT -> UPDATE PROJECT
|--------------------------------------------------------------------------
*/
export async function PUT(req: NextRequest) {
  try {
    const user_id = getUserId(req);

    if (!user_id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, client_name, project_url, status, description, company_logo } = body;

    if (!id || !isUUID(id)) {
      return NextResponse.json({ success: false, message: "Valid project id required" }, { status: 400 });
    }

    const errorMessage = validate(body);
    if (errorMessage) {
      return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        title: title.trim(),
        client_name: client_name.trim(),
        project_url,
        status,
        description: description.trim(),
        company_logo,
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
| DELETE -> DELETE PROJECT
|--------------------------------------------------------------------------
*/
export async function DELETE(req: NextRequest) {
  try {
    const user_id = getUserId(req);

    if (!user_id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id || !isUUID(id)) {
      return NextResponse.json({ success: false, message: "Valid project id required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Project deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
