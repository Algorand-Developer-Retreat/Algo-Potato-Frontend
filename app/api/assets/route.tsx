import { NextResponse } from "next/server";

const ASA_LIST_URL = "https://asa-list.tinyman.org/assets.json";

export async function GET() {
  try {
    const response = await fetch(ASA_LIST_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.log("Error fetching assets:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}
