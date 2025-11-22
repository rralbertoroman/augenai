import { NextRequest, NextResponse } from "next/server";
import { getPatients, createPatient } from "@/server/services/patient";

export async function GET() {
  try {
    const patients = await getPatients();
    return NextResponse.json(patients);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch patients";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const patient = await createPatient(data);
    return NextResponse.json(patient);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create patient";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
