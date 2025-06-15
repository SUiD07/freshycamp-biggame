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
import React, { useState, useEffect, useRef } from "react";
import NewMoveForm from "@/components/mine/NewMoveForm";
import NewPurchaseForm from "@/components/mine/NewPurchasesForm";
export default function Home() {
  const round = 1;
  const house = "บ้าน 03"; // ปรับตามผู้ใช้งานที่ login
  const houseT = "B3";
  const [autoRefresh, setAutoRefresh] = useState(false);
  
    // Double-iframe logic
      const [showOldIframe, setShowOldIframe] = useState(true);
      const [iframeKeyNew, setIframeKeyNew] = useState(Date.now());
      const [iframeKeyOld, setIframeKeyOld] = useState(Date.now());
      const [refreshing, setRefreshing] = useState(false);
      
        // Use ref to track refreshing synchronously and avoid race conditions
        const refreshingRef = useRef(false);

  const lookerUrl =
    "https://lookerstudio.google.com/embed/reporting/54c759f2-1a00-48e0-b7c0-6ccdfe5947aa/page/MJqKF";
    
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
   
  // Extracted refresh logic function
  const triggerRefresh = () => {
  if (!refreshingRef.current) {
    // Turn off auto-refresh when manual refresh starts
    setAutoRefresh(false);

      refreshingRef.current = true;
      setRefreshing(true);

      // Step 1: Load new iframe (hidden), show old iframe
      setIframeKeyNew(Date.now());
      setShowOldIframe(true);

      // Step 2: After 6 seconds, switch to new iframe
      setTimeout(() => {
        setShowOldIframe(false);
        setRefreshing(false);
        refreshingRef.current = false;

      setTimeout(() => {
        setIframeKeyOld(Date.now());
        // Re-enable auto-refresh after refresh completes
        setAutoRefresh(true);
      }, 1000);
    }, 5000);
  }
};

  // Auto-refresh logic with sequential iframe updates calling the same function
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        triggerRefresh();
      }, 20000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <RequireHouseAuth expectedHouse="03">
      <main className="p-6 space-y-6">
        <h1 className="font-bold text-2xl text-center bg-slate-300">{house}</h1>
        <OwnedNodePopover houseId={houseT} />
        <Map />
         <div className="text-center mb-4">
          {/*<p>Auto-refresh: {autoRefresh ? "ON" : "OFF"}</p>
          <p>Currently showing: {showOldIframe ? "Old iframe" : "New iframe"}</p>
          <p>Refreshing: {refreshing ? "Yes" : "No"}</p>*/}
          <p>ถ้าใช้คอมไม่ต้องกดรีเฟรชนะ มันรีเฟรชเองอยู่แล้ว</p>
        </div>
       <div className=" flex justify-start ml-24 mb-8">
          <button
            onClick={triggerRefresh}
            disabled={refreshing}
            className="bg-yellow-300 px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
          >
          {refreshing ? "Refreshing..." : "Refresh Now"}
          </button>
      </div>

        {/* Iframe container with manual refresh button */}
        <div style={{ position: "relative", width: 1000, height: 1300, margin: "0 auto" }}>
            {/* Old iframe */}
            <iframe
              key={iframeKeyOld}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 1000,
                height: 1300,
                opacity: showOldIframe ? 1 : 0,
                zIndex: showOldIframe ? 2 : 1,
                transition: "opacity 0.3s",
              }}
              src={lookerUrl + "?t=" + iframeKeyOld}
              title="Looker Studio Report (Old)"
              allowFullScreen
            />
            {/* New iframe */}
            <iframe
              key={iframeKeyNew}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 1000,
                height: 1300,
                opacity: showOldIframe ? 0 : 1,
                zIndex: showOldIframe ? 1 : 2,
                transition: "opacity 0.3s",
              }}
                src={lookerUrl + "?t=" + iframeKeyNew}
                title="Looker Studio Report (New)"
                allowFullScreen
            />
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
                  <NewMoveForm house={houseT} />
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
                  {/* <PurchaseForm house={house} /> */}
                  <NewPurchaseForm house={house} houseT={houseT} />
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
