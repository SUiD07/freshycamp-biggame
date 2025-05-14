import { fetchExcelData } from "@/utils/fetchExcel";
import { uploadToSupabase } from "@/utils/uploadToSupabase";

export async function POST(req: Request) {
  try {
    // ดึงข้อมูลจาก Excel
    const data = await fetchExcelData();

    // อัปโหลดข้อมูลไปยัง Supabase
    await uploadToSupabase(data);

    // ส่ง Response กลับ
    return new Response(
      JSON.stringify({ message: "Upload success", rows: data.length }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
