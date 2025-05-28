"use client";
import MoveForm from "@/components/mine/MoveForm";
import Map from "@/app/map/page";
import PurchaseForm from "@/components/mine/PurchasesForm";
import { Separator } from "@/components/ui/separator";
import { RequireHouseAuth } from "@/components/mine/RequireAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyMovesTable from "@/components/mine/MoveTable";
import ShipTable from "@/components/mine/ShipTable";
import PurchasesTable from "@/components/mine/PurchasesTable";
import OwnedNodePopover from "@/components/mine/OwnedNodesPopover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";
import { useAutoRefreshContext } from "@/context/AutoRefreshContext";
import { useAutoRefresh } from "@/hooks/useAutoRefresh"; // Your existing hook
import AutoRefreshControl from "@/components/AutoRefreshControls";

export default function Home() {
  const round = 1;
  const house = "บ้าน 01"; // ปรับตามผู้ใช้งานที่ login
  const houseT = "B1";
  const { isAutoRefresh } = useAutoRefreshContext();
  const refreshKey = useAutoRefresh(12000, isAutoRefresh);

  return (
    <RequireHouseAuth expectedHouse="01">
      <main className="p-6 space-y-6">
        <h1 className="font-bold text-2xl text-center bg-slate-300">{house}</h1>
        <OwnedNodePopover houseId={houseT} />
        <Sheet>
          <SheetTrigger className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">กรอก</SheetTrigger>
          <SheetContent className="!w-[700px] !max-w-none overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Form</SheetTitle>
              <SheetDescription>
                กรอกการเคลื่อนที่ กรอกการสร้างและชุบชีวิต
                <div className="w-min mx-auto">
                  <Tabs defaultValue="account" className="w-fit max-md:w-9/12">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="account">เดิน</TabsTrigger>
                      <TabsTrigger value="password">สร้าง</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                      <Card>
                        <CardHeader>
                          <CardTitle className="bg-purple-300">
                            กรอกการเคลื่อนที่
                          </CardTitle>
                          <CardDescription>
                            เดิน เดิน เดิน เดินนนนนนนนนนนน
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {/* <h1 className="text-xl font-bold bg-purple-300">
                    กรอกการเคลื่อนที่ */}
                          {/* (รอบ {round}) */}
                          {/* </h1> */}
                          <MoveForm house={house} />
                        </CardContent>
                        {/* <CardFooter> */}
                        {/* <Button>Save changes</Button> */}
                        {/* </CardFooter> */}
                      </Card>
                    </TabsContent>
                    <TabsContent value="password">
                      <Card>
                        <CardHeader>
                          <CardTitle className="bg-purple-300">
                            กรอกการสร้างและชุบชีวิต
                          </CardTitle>
                          <CardDescription>
                            ใช้ทรัพยากรรรรรรรรรร
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {/* <h1 className="text-xl font-bold bg-purple-300">
                    กรอกการสร้าง */}
                          {/* (รอบ {round}) */}
                          {/* </h1> */}
                          <PurchaseForm house={house} />
                        </CardContent>
                        {/* <CardFooter> */}
                        {/* <Button>Save password</Button> */}
                        {/* </CardFooter> */}
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Map />
      <div className="p-6">
      <AutoRefreshControl />

      <h1 className="text-xl font-bold mb-4">Folder 1 Page - Auto Refresh Example</h1>
      <div key={refreshKey}>
        <iframe
          width="600"
          height="450"
          src="https://lookerstudio.google.com/embed/reporting/bb110558-9426-4faa-80e0-70bda8fcbe69/page/2YaKF"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          title="Looker Studio Report"
        />
      </div>
    </div>
        <div className="w-min mx-auto">
          <Tabs defaultValue="account" className="w-fit max-md:w-9/12">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">เดิน</TabsTrigger>
              <TabsTrigger value="password">สร้าง</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle className="bg-purple-300">
                    กรอกการเคลื่อนที่
                  </CardTitle>
                  <CardDescription>
                    เดิน เดิน เดิน เดินนนนนนนนนนนน
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* <h1 className="text-xl font-bold bg-purple-300">
                    กรอกการเคลื่อนที่ */}
                  {/* (รอบ {round}) */}
                  {/* </h1> */}
                  <MoveForm house={house} />
                </CardContent>
                {/* <CardFooter> */}
                {/* <Button>Save changes</Button> */}
                {/* </CardFooter> */}
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle className="bg-purple-300">
                    กรอกการสร้างและชุบชีวิต
                  </CardTitle>
                  <CardDescription>ใช้ทรัพยากรรรรรรรรรร</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* <h1 className="text-xl font-bold bg-purple-300">
                    กรอกการสร้าง */}
                  {/* (รอบ {round}) */}
                  {/* </h1> */}
                  <PurchaseForm house={house} />
                </CardContent>
                {/* <CardFooter> */}
                {/* <Button>Save password</Button> */}
                {/* </CardFooter> */}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <MyMovesTable house={house} />
        <ShipTable house={house} />
        <PurchasesTable house={house} />
        {/* <hr /> */}
      </main>
    </RequireHouseAuth>
  );
}
