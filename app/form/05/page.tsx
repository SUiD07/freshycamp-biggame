import MoveForm from "@/components/mine/MoveForm";
import Map from "@/app/map/page";
import PurchaseForm from "@/components/mine/PurchasesForm";

export default function Home() {
  const round = 1;
  const house = "บ้าน 05"; // ปรับตามผู้ใช้งานที่ login

  return (
    <main className="p-6 space-y-6">
      <h1 className="font-bold text-2xl text-center bg-slate-300">{house}</h1>
      <Map />
      <iframe
        width="700"
        height="1000"
        className="mx-auto"
        src="https://lookerstudio.google.com/embed/reporting/873cd1af-3bf4-45cb-aed1-306cbb48dea5/page/p_9y47cxdmqd"
      ></iframe>
      <div className="w-min mx-auto">
        <h1 className="text-xl font-bold">
          กรอกการเคลื่อนที่
          {/* (รอบ {round}) */}
        </h1>
        <MoveForm house={house} />
        <div>
          -----------------------------------------------------------------------------
        </div>
        <h1 className="text-xl font-bold">
          กรอกการสร้าง
          {/* (รอบ {round}) */}
        </h1>
        <PurchaseForm house={house} />
      </div>
      {/* <hr /> */}
    </main>
  );
}
