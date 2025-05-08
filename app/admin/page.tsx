"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import React from "react";
import NodeUpdater from "@/components/mine/NodeUpdater";
import RoundResult from "@/components/mine/RoundResult";


export default function admin() {
  const round = 1;
  //const house = "บ้าน 01"; // ปรับตามผู้ใช้งานที่ login
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
  return (
    <>
      <div>admin</div>
      {/* <table>
          <thead>
            <tr>
              <th>ID</th> */}
              {/* <th>Top</th> */}
              {/* <th>Left</th> */}
              {/* <th>Value</th>
              <th>SElected car</th>
              <th>tower</th>
              <th>ship</th>
              <th>fight</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node: any) => (
              <tr>
                <td className="border-2">{node.id}</td> */}
                {/* <td>{node.top}</td> */}
                {/* <td>{node.left}</td> */}
                {/* <td className="border-2">{node.value}</td>
                <td className="border-2">{node.selectedCar}</td>
                <td className="border-2">{node.tower}</td>
                <td className="border-2">{node.ship}</td>
                <td className="border-2">{node.fight}</td>
              </tr>
            ))}
          </tbody>
        </table> */}
        <h2 className="text-lg font-semibold">สรุปสถานะรอบ {round}</h2>
        <RoundResult/>
        <NodeUpdater/>
    </>
  );
}
