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

export default function Map() {
  const supabase = createClient();
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
    B12: "#ffffff",
  };
  return (
    <>
      <div className="text-center">map</div>
      {/* <div className="flex gap-2 [&>input]:mb-3 mt-8"> */}
      {/* <Label htmlFor="search" className="">Search</Label> */}
      {/* <Input name="search" placeholder="search" required />
        <Button>Search</Button> */}
      {/* </div> */}
      <main>
        <div className="relative w-full mb-10">
          <div className="w-full text-center">
            <img
              src="/map.png"
              alt="map"
              className="inline-block w-[90%] h-auto"
            />
          </div>
          {nodes.map((node: any, index: any) => (
            <div
              key={index}
              style={{
                backgroundColor:
                  houseColorMap[node.selectedcar?.trim()] ?? "transparent",
                fontSize: "1vw",
                padding: "0.1em",
                // borderRadius: "0.5em",
                whiteSpace: "nowrap",
                top: `${parseFloat(node.top) + 4}%`,
                left: node.left,
                width: "3em",
              }}
              className="text-center absolute p-2 transform -translate-x-1/2 -translate-y-1/2 text-[clamp(10px,2.5vw,16px)]"
            >
              {node.value}
              {/* {node.value !== "0" && "("} */}
              {/* {node.selectedCar}
            {node.value !== "0" && ")"} */}
            </div>
          ))}
          {/* node ที่ */}
          {nodes.map((node: any, index: any) => (
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
              className="font-bold absolute p-2 rounded-md transform -translate-x-1/2 -translate-y-1/2 text-[clamp(10px,2.5vw,16px)]"
            >
              {node.id}
            </div>
          ))}

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
                  width: "3vw",
                  height: "3vw",
                }}
              />
              {node.tower && node.towerOwner && (
                <div
                  className="absolute text-xs text-black font-semibold text-center"
                  style={{
                    top: `${parseFloat(node.top) + 4}%`,
                    left: `${parseFloat(node.left) - 2}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: "0.8vw",
                  }}
                >
                  {node.towerOwner}
                </div>
              )}

              {/* เรือ */}
              {node.ship &&
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
                ))}

              {/* การสู้ */}
              {node.fight &&
                node.fight.map((f: any, idx: any) => (
                  <>
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
                        top: `${parseFloat(node.top) + 1.7 + idx * 2}%`,
                        left: `${parseFloat(node.left) + 2.5}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className="text-center text-red-600 font-bold text-xs mt-1"
                        style={{ fontSize: "1vw" }}
                      >
                        {f.house} ({f.count})
                      </div>
                    </div>
                  </>
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
