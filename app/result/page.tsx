"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import React from "react";
import NodeUpdater from "@/components/mine/NodeUpdater";
import RoundResult from "@/components/mine/RoundResult";
import dynamic from 'next/dynamic';


export default function admin() {
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
    const RoundResult = dynamic(() => import('@/components/mine/RoundResult'), { ssr: false });
  return (
    <>
      <div className="font-bold text-2xl text-center bg-gray-300">ดูผลการกรอก</div>
        <h2 className="text-lg font-semibold">สรุปสถานะ</h2>
        <RoundResult/>
    </>
  );
}
