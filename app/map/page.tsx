"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import React from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { signInAction } from "../actions";
import { Button } from "@/components/ui/button";
import { data } from "autoprefixer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Toast } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import CountdownTimer from "@/components/mine/CountdownTimer";
import { supabase } from "@/lib/supabase";
import { ClientPhaseDisplay } from "@/components/mine/ClientPhaseDisplay";
import { ClientPhaseLogDisplay } from "@/components/mine/ClientPhaseLogDisplay";
// import ChatPage from "../chat/page";

export default function Map() {
  // const supabase = createClient();
  const [nodes, setNodes] = useState<any>([]);
  const fetchUser = async () => {
    let { data, error } = await supabase.from("nodes").select("*");

    if (!data || error) {
      console.log("error", error);
    }
    setNodes(data);
  };
  useEffect(() => {
    fetchUser();
  }, []);

  const houseColorMap: Record<string, string> = {
    B1: "#c00000",
    B2: "#ff6600",
    B3: "#936f01",
    B4: "#ffff00",
    B5: "#92d14f",
    B6: "#00af51",
    B7: "#01b0f1",
    B8: "#0070c0",
    B9: "#abb9ca",
    B10: "#7030a0",
    B11: "#ff66ff",
    B12: "#f9d4b4",
  };
  const nodeColorMap: Record<string, string> = {
    ป้อม: "#9ff27e",
    ทรัพยากร: "#f2ec7e",
    ท่าเรือ: "#f2b3d8",
    center: "#ff0303",
  };
  // ตัวอักษรสีขาว
  const whiteTextHouses = ["B1", "B3", "B6", "B8", "B9", "B10"];
  return (
    <>
      {/* <div className="text-center text-xl font-bold">map</div> */}
      <Button
        className="m-4"
        onClick={async () => {
          await fetchUser();
          toast({
            title: "อัปเดตข้อมูลแล้ว",
            description: "โหลดข้อมูลจากฐานข้อมูลสำเร็จ",
            action: (
              <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
            ),
          });
        }}
      >
        🔄 รีเฟรชข้อมูลแผนที่
      </Button>
      <Sheet>
        <SheetTrigger className="bg-gray-300 p-2 rounded-md m-2 hover:bg-gray-400">
          คลิกเพื่อดูตารางสีแต่ละบ้าน
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>ตารางสีแต่ละบ้าน</SheetTitle>
            <SheetDescription>
              <Table>
                <TableCaption>ตารางสีประจำบ้าน</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>บ้าน</TableHead>
                    <TableHead>สี</TableHead>
                    <TableHead>ตัวอย่างสี</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(houseColorMap).map(([house, color]) => (
                    <TableRow key={house}>
                      <TableCell className="font-medium">{house}</TableCell>
                      <TableCell>{color}</TableCell>
                      <TableCell>
                        <div
                          className="w-6 h-6 rounded"
                          style={{
                            backgroundColor: color,
                            border: "1px solid #ccc",
                          }}
                        ></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger className="bg-gray-300 p-2 rounded-md m-2 hover:bg-gray-400">
          คลิกเพื่อดูตาราง Node
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Node</SheetTitle>
            <SheetDescription>
              <Table>
                <TableCaption>ตารางสีประจำบ้าน</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Node</TableHead>
                    <TableHead>สี</TableHead>
                    <TableHead>ตัวอย่างสี</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(nodeColorMap).map(([node, color]) => (
                    <TableRow key={node}>
                      <TableCell className="font-medium">{node}</TableCell>
                      <TableCell>{color}</TableCell>
                      <TableCell>
                        <div
                          className="w-6 h-6 rounded"
                          style={{
                            backgroundColor: color,
                            border: "1px solid #ccc",
                          }}
                        ></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {/* <ClientPhaseDisplay /> */}
      {/* <ClientPhaseLogDisplay/> */}
      {/* <ChatPage/> */}
      {/* <div className="flex gap-2 [&>input]:mb-3 mt-8"> */}
      {/* <Label htmlFor="search" className="">Search</Label> */}
      {/* <Input name="search" placeholder="search" required />
        <Button>Search</Button> */}
      {/* </div> */}
      <main>
        <div className="relative w-full mb-10">
          <div className="w-full text-center">
            <img
              src="/mapFinal.png"
              alt="map"
              className="inline-block w-[90%] h-auto"
            />
          </div>
          {nodes.map((node: any, index: any) => {
            const selectedCar = node.selectedcar?.trim();
            const isWhiteText = whiteTextHouses.includes(selectedCar);
            const displayValue = node.value ?? 0; // ถ้า null หรือ undefined จะเป็น 0

            return (
              <div
                key={index}
                style={{
                  backgroundColor: houseColorMap[selectedCar] ?? "transparent",
                  color: isWhiteText ? "white" : "black",
                  fontSize: "0.75vw",
                  padding: "0.1em",
                  whiteSpace: "nowrap",
                  top: `${parseFloat(node.top) + 2.7}%`,
                  left: node.left,
                  width: "3em",
                }}
                className="text-center absolute p-2 transform -translate-x-1/2 -translate-y-1/2 text-[clamp(10px,2.5vw,16px)]"
              >
                {displayValue}
              </div>
            );
          })}
          {/* node ที่ */}
          {/* เงื่อนไขที่เมื่อมีบ้านมาที่nodeมาที่ป้อมของบ้านอื่นแต่จำนวนคนของบ้านเจ้าของป้อมเป็น0 
          tower===true&& towerOwner!==selectedcar&&(fight===nullหรือfight===[]) */}
          {nodes.map((node: any, index: any) => {
            const showExplosion =
              node.tower === true &&
              node.towerOwner !== node.selectedcar &&
              (node.fight === null ||
                (Array.isArray(node.fight) && node.fight.length === 0));

            return (
              <div
                key={index}
                style={{
                  fontSize: "1vw",
                  padding: "0.5em",
                  borderRadius: "0.5em",
                  whiteSpace: "nowrap",
                  top: node.top,
                  left: node.left,
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
              >
                {/* node.id layer (พื้นหลัง) */}
                <div className="text-black font-black text-stroke-white tracking-tight scale-y-110 p-2 rounded-md z-10">
                  {node.id}
                </div>

                {/* explosion layer (อยู่หน้าสุด ถ้ามี) */}
                {showExplosion && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none opacity-50">
                    <span className="text-[3vw]">🤯</span>
                  </div>
                )}
              </div>
            );
          })}

          {nodes.map((node: any) => (
            <React.Fragment key={node.id}>
              {/* ป้อม */}
              <img
                src="/fortress.svg"
                alt="fortress"
                className="absolute"
                style={{
                  top: node.top,
                  left: `${parseFloat(node.left) - 1.9}%`,
                  opacity: node.tower ? 1 : 0,
                  transform: "translate(-50%, -50%)",
                  transition: "opacity 0.3s",
                  zIndex: 10,
                  width: "2vw",
                  height: "2vw",
                }}
              />
              {node.tower && node.towerOwner && (
                <div
                  className="absolute text-xs text-black font-semibold text-center"
                  style={{
                    top: `${parseFloat(node.top) + 3}%`,
                    left: `${parseFloat(node.left) - 2}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: "0.8vw",
                  }}
                >
                  {node.towerOwner}
                </div>
              )}

              {/* เรือ */}
              {/* {node.ship &&
                node.ship.map((ship: any, index: any) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      top: `${parseFloat(node.top) - 6}%`,
                      left: `${parseFloat(node.left) + index * 2}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className="text-center text-purple-600 text-xs mt-1"
                      style={{ fontSize: "1vw", padding: "0em" }}
                    >
                      {ship}
                    </div>
                    <img
                      src="/boat.svg"
                      alt="ship"
                      className="w-8 h-8"
                      style={{ width: "3vw", height: "3vw" }}
                    />
                  </div>
                ))} */}

              {/* การสู้ */}
              {node.fight &&
                node.fight.map((f: any, idx: any) => (
                  <div>
                    {idx === 0 && (
                      <img
                        src="/sword.svg"
                        alt="fight"
                        className="w-8 h-8 absolute"
                        style={{
                          top: `${parseFloat(node.top) + idx * 2}%`,
                          left: `${parseFloat(node.left) + 2}%`,
                          transform: "translate(-50%, -50%)",
                          width: "1.7vw",
                          height: "1.7vw",
                        }}
                      />
                    )}
                    <div
                      key={idx}
                      className="absolute"
                      style={{
                        top: `${parseFloat(node.top) + 1.7 + idx * 1.5}%`,
                        left: `${parseFloat(node.left) + 2.5}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className="text-center text-red-600 font-bold text-xs mt-1 z-auto"
                        style={{ fontSize: "0.8vw" }}
                      >
                        {f.house} ({f.count})
                      </div>
                    </div>
                  </div>
                ))}
            </React.Fragment>
          ))}
        </div>
        {/* <iframe
          width="900"
          height="1200"
          className="mx-auto"
          src="https://lookerstudio.google.com/embed/reporting/873cd1af-3bf4-45cb-aed1-306cbb48dea5/page/p_9y47cxdmqd"
        ></iframe>{" "} */}
        {/* <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Top</th>
              <th>Left</th>
              <th>Value</th>
              <th>SElected car</th>
              <th>tower</th>
              <th>ship</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr>
                <td>{user.id}</td>
                <td>{user.top}</td>
                <td>{user.left}</td>
                <td>{user.value}</td>
                <td>{user.selectedCar}</td>
                <td>{user.tower ? "Yes" : "No"}</td>
                <td>{JSON.stringify(user.ship)}</td>
              </tr>
            ))}
          </tbody>
        </table> */}
        {/* <CountdownTimer /> */}
        <div
          className="fixed bottom-0 left-0 z-50 origin-bottom-left"
          style={{ transform: "scale(0.47)", transformOrigin: "bottom left" }}
        >
          <iframe
            src="https://keepthescore.com/embed/wvcyndnlzdzrr/"
            width="500"
            height="500"
            className="pointer-events-auto"
            // frameBorder="0"
          ></iframe>
        </div>

        <a
          href="https://chula.zoom.us/j/95949815386?pwd=HhBKtW1im2IlMpNqLAS00CaaFtZT7j.1"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-500 flex mx-auto text-white"
        >
          Join Zoom Meeting
        </a>
        <a
          href="https://docs.google.com/spreadsheets/d/1HSk7Gxhpw0TN4-4Qaorkv9kvxp5zIxTBImz70faWDWM/edit?gid=0#gid=0"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-200 flex mx-auto"
        >
          google sheet trade
        </a>
        <a
          href="https://docs.google.com/spreadsheets/d/1PqjmLgZvde99r4JfkE4-MpS0cYHx9S200fKwjdx1skQ/edit?pli=1&gid=1465921370"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-200 flex mx-auto"
        >
          google sheet กรณีหน้าจอไม่แสดงผลทรัพยากร
        </a>
      </main>
      {/* <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Submit
        </SubmitButton>
      </div> */}
    </>
  );
}
