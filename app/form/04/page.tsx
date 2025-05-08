import MoveForm from "@/components/mine/MoveForm";

export default function Home() {
  const round = 1;
  const house = "บ้าน 04"; // ปรับตามผู้ใช้งานที่ login

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        กรอกการเคลื่อนที่
        {/* (รอบ {round}) */}
      </h1>
      <MoveForm round={round} house={house} />
      <hr />
    </main>
  );
}
