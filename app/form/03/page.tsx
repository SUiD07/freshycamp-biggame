import MoveForm from "@/components/mine/MoveForm";
import Map from "@/app/map/page";
import PurchaseForm from "@/components/mine/PurchasesForm";
import { Separator } from "@/components/ui/separator";
import { RequireHouseAuth } from "@/components/mine/RequireAuth";

export default function Home() {
  const round = 1;
  const house = "บ้าน 03"; // ปรับตามผู้ใช้งานที่ login

  return (
    <RequireHouseAuth expectedHouse="03">
      <main className="p-6 space-y-6">
        <h1 className="font-bold text-2xl text-center bg-slate-300">{house}</h1>
        <Map />
        <iframe
          width="700"
          height="520"
          className="mx-auto"
          src="https://lookerstudio.google.com/embed/reporting/54c759f2-1a00-48e0-b7c0-6ccdfe5947aa/page/MJqKF"
        ></iframe>
        <div className="w-min mx-auto">
          <h1 className="text-xl font-bold bg-purple-300">
            กรอกการเคลื่อนที่
            {/* (รอบ {round}) */}
          </h1>
          <MoveForm house={house} />
          <Separator className="my-10" />
          <h1 className="text-xl font-bold bg-purple-300">
            กรอกการสร้าง
            {/* (รอบ {round}) */}
          </h1>
          <PurchaseForm house={house} />
        </div>
        {/* <hr /> */}
      </main>
    </RequireHouseAuth>
  );
}
