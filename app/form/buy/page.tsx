// import MoveForm from "@/components/mine/MoveForm";
import PurchaseForm from "@/components/mine/PurchasesForm";

export default function Home() {
  const round = 1;
  const house = "บ้าน 01"; // ปรับตามผู้ใช้งานที่ login

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        กรอกการเคลื่อนที่
        {/* (รอบ {round}) */}
      </h1>
      {/* <MoveForm house={house} /> */}
      <PurchaseForm house={house}/>
      <hr />
    </main>
  );
}
