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
import NewMoveForm from "@/components/mine/NewMoveForm";
import Image from 'next/image';
import styles from './BackgroundContainer.module.css';
export default function Home() {
  const round = 1;
  const house = "บ้าน 01"; // ปรับตามผู้ใช้งานที่ login
  const houseT = "B1";
  const [autoRefresh, setAutoRefresh] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const lookerUrl =
    "https://lookerstudio.google.com/embed/reporting/bb110558-9426-4faa-80e0-70bda8fcbe69/page/2YaKF";
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
    <RequireHouseAuth expectedHouse="01">
      <main className=" space-y-6">
        <h1 className="font-bold text-2xl text-center bg-slate-300">{house}</h1>
        <OwnedNodePopover houseId={houseT} />
        <Map />
          <div className={styles.backgroundContainer} style={{ position: 'relative' }}>
      <Image
        src="/bg.png"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={80}
        style={{ zIndex: -1 }}
      />
      <iframe
        width="1200"
        height="900"
        src={lookerUrl}
        title="Looker Studio Report"
        allowFullScreen
        style={{ position: 'relative', background: 'transparent', border: 'none' }}
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
