"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import React from "react";


export default function admin() {
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
      <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Top</th>
              <th>Left</th>
              <th>Value</th>
              <th>SElected car</th>
              <th>tower</th>
              <th>ship</th>
              <th>fight</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node: any) => (
              <tr>
                <td>{node.id}</td>
                <td>{node.top}</td>
                <td>{node.left}</td>
                <td>{node.value}</td>
                <td>{node.selectedCar}</td>
                <td>{node.ship}</td>
                <td>{node.fight}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </>
  );
}
