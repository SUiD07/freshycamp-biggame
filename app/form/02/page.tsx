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
import React, { useEffect, useState } from "react";

export default function Home() {
  const round = 1;
  const house = "บ้าน 02"; // ปรับตามผู้ใช้งานที่ login
  const houseT = "B2";
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
  setRefreshKey((prevKey) => prevKey + 1);
  }, 20000); // refresh every 30 seconds
  
  return () => clearInterval(interval);
    }, [isAutoRefresh]);

  return (
    <RequireHouseAuth expectedHouse="02">
      <main className="p-6 space-y-6">
        <h1 className="font-bold text-2xl text-center bg-slate-300">{house}</h1>
        <OwnedNodePopover houseId={houseT} />
        <Sheet>
          <SheetTrigger className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            กรอก
          </SheetTrigger>
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
        <div className="w-full h-full flex flex-col justify-center items-center">

          <h2 className="mb-4">the table</h2>
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`mb-4 px-4 py-2 rounded ${
              isAutoRefresh ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            } text-white`}
          >
            {isAutoRefresh ? "Stop Auto Refresh" : "Start Auto Refresh"}
          </button>
          <iframe
            key={refreshKey}
            referrerPolicy="no-referrer-when-downgrade"
            src="https://view-awesome-table.com/-ORDIUjSK6xGZLMKbbIV/view"
            style={{ border: "none", height: "600px", width: "100%" }}
          >
          </iframe>
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
