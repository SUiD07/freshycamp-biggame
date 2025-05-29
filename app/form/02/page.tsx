"use client"
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
import React, { useState, useEffect, useRef } from "react"

export default function Home() {
  const round = 1;
  const house = "บ้าน 02"; // ปรับตามผู้ใช้งานที่ login
  const houseT = "B2";
  const [autoRefresh, setAutoRefresh] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const refreshInterval = useRef<NodeJS.Timeout | null>(null);
    const lookerUrl =
      "https://lookerstudio.google.com/embed/reporting/6e15db3c-d9b7-49f0-80a1-bb8988294c6f/page/MJqKF";
    // Initialize autoRefresh from localStorage on mount
    useEffect(() => {
      const stored = localStorage.getItem("autoRefresh");
      setAutoRefresh(stored === "true");
    }, []);
  
    // Listen for localStorage changes from other tabs/pages
    useEffect(() => {
      const onStorage = (e: StorageEvent) => {
        if (e.key === "autoRefresh") {
          setAutoRefresh(e.newValue === "true");
        }
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }, []);
  
    // Handle iframe reload interval based on autoRefresh
    useEffect(() => {
      if (autoRefresh) {
        refreshInterval.current = setInterval(() => {
          if (iframeRef.current) {
            iframeRef.current.src = lookerUrl + "?t=" + new Date().getTime();
          }
        }, 20000);
      } else {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
          refreshInterval.current = null;
        }
      }
  
      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
          refreshInterval.current = null;
        }
      };
    }, [autoRefresh, lookerUrl]);

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
        <iframe
          ref={iframeRef}
          width="900"
          height="1200"
          className="mx-auto"
          src={lookerUrl}
          title="Looker Studio Report"
          allowFullScreen
        ></iframe>
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
