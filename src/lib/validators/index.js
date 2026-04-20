import { errorResponse } from "@/lib/errors.js";

/**
 * Validates request body against a Zod schema.
 * Returns { data, response } — if response is non-null, return it immediately.
 *
 * Usage:
 *   const { data, response } = await validateBody(request, mySchema);
 *   if (response) return response;
 */
export async function validateBody(request, schema) {
  let body;
  try {
    body = await request.json();
  } catch {
    return {
      data: null,
      response: errorResponse("VALIDATION_ERROR", "Ungültiger JSON-Body", 400),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      data: null,
      response: errorResponse(
        "VALIDATION_ERROR",
        "Ungültige Eingabedaten",
        400,
        result.error.flatten().fieldErrors
      ),
    };
  }

  return { data: result.data, response: null };
}

/**
 * Validates URL search params against a Zod schema.
 * Returns { data, response }.
 */
export function validateParams(searchParams, schema) {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);

  if (!result.success) {
    return {
      data: null,
      response: errorResponse(
        "VALIDATION_ERROR",
        "Ungültige Query-Parameter",
        400,
        result.error.flatten().fieldErrors
      ),
    };
  }

  return { data: result.data, response: null };
}
