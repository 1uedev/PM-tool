import { NextResponse } from "next/server";

/**
 * Returns a consistent JSON error response.
 * @param {string} code - Error code (e.g. "AUTH_ERROR", "NOT_FOUND")
 * @param {string} message - Human-readable error message
 * @param {number} status - HTTP status code
 * @param {object} [details] - Optional field-level validation details
 */
export function errorResponse(code, message, status, details) {
  const body = { error: { code, message } };
  if (details) body.error.details = details;
  return NextResponse.json(body, { status });
}

/**
 * Returns a consistent JSON success response.
 * @param {*} data - Response payload
 * @param {number} [status=200] - HTTP status code
 */
export function successResponse(data, status = 200) {
  return NextResponse.json({ data }, { status });
}
