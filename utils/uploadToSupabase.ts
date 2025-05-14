import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const uploadToSupabase = async (data: any[]) => {
  // ไม่ต้องใช้ onConflict เพราะ id เป็น auto-increment
  const { error } = await supabase
    .from("excel_updates")
    .upsert(data);  // ใช้ upsert แบบทั่วไป
  if (error) throw error;
};
