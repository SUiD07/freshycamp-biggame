"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function NodeUpdater() {
  const supabase = createClient();
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [selectedcar, setSelectedcar] = useState<string>("B1");
  const [nodeValues, setNodeValues] = useState<Record<string, string>>({});
  const [newShips, setNewShips] = useState<{ house: string }[]>([]);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    const { data, error } = await supabase.from("nodes").select("*");
    if (error) console.error("Fetch error:", error);
    else setNodes(data);
  };

  const handleAddNode = () => {
    if (selectedNode && !selectedNodeIds.includes(selectedNode)) {
      setSelectedNodeIds((prev) => [...prev, selectedNode]);
    }
  };

  const handleRemoveNode = (nodeId: string) => {
    setSelectedNodeIds((prev) => prev.filter((id) => id !== nodeId));
    setNodeValues((prev) => {
      const updated = { ...prev };
      delete updated[nodeId];
      return updated;
    });
  };

  const handleValueChange = (nodeId: string, newValue: string) => {
    setNodeValues((prev) => ({
      ...prev,
      [nodeId]: newValue,
    }));
  };

  const handleUpdate = async () => {
    if (selectedNodeIds.length === 0) return;

    for (const id of selectedNodeIds) {
      const value = nodeValues[id] || "";
      const { error } = await supabase
        .from("nodes")
        .update({ selectedcar, value })
        .eq("id", id);

      if (error) console.error(`Error updating Node ${id}:`, error);
    }

    fetchNodes();
  };

  // const toggleField = async (id: string, field: "tower" | "bost", currentValue: boolean) => {
  //   const { error } = await supabase
  //     .from("nodes")
  //     .update({ [field]: !currentValue })
  //     .eq("id", id);
  //   if (error) console.error(`Toggle ${field} error:`, error);
  //   else fetchNodes();
  // };
  // Toggle tower ของ node
  const toggleTower = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("nodes")
      .update({ tower: !currentValue })
      .eq("id", id);
    if (error) console.error("Toggle tower error:", error);
    else fetchNodes();
  };

  const addShips = async (id: string) => {
    const node = nodes.find((n) => n.id === id);
    const existingShips = node.ship || [];
    const newShipHouses = newShips.map((s) => s.house);
    const updatedShip = [...existingShips, ...newShipHouses];

    const { error } = await supabase
      .from("nodes")
      .update({ ship: updatedShip })
      .eq("id", id);

    if (error) console.error("Add ships error:", error);
    else {
      fetchNodes();
      setNewShips([]);
    }
  };

  const removeShip = async (id: string, index: number) => {
    const node = nodes.find((n) => n.id === id);
    const newShip = [...(node.ship || [])];
    newShip.splice(index, 1);

    const { error } = await supabase
      .from("nodes")
      .update({ ship: newShip })
      .eq("id", id);

    if (error) console.error("Remove ship error:", error);
    else fetchNodes();
  };

  const handleNewShipChange = (index: number, house: string) => {
    const updated = [...newShips];
    updated[index].house = house;
    setNewShips(updated);
  };

  const addNewShipField = () => {
    setNewShips((prev) => [...prev, { house: "B1" }]);
  };

  const removeNewShipField = (index: number) => {
    const updated = [...newShips];
    updated.splice(index, 1);
    setNewShips(updated);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg mb-4">Node Updater</h2>

      {/* เลือก Node */}
      <div className="mb-4">
        <label className="block mb-2">เลือก Node ที่จะ update:</label>
        <div className="flex gap-2 mb-4">
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">-- เลือก Node --</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                Node {node.id}
              </option>
            ))}
          </select>
          <Button onClick={handleAddNode}>เพิ่ม</Button>
        </div>
      </div>

      {/* เลือกรถ */}
      <div className="mb-4">
        <label className="block mb-2">เลือกบ้านที่จะ update:</label>
        <select
          value={selectedcar}
          onChange={(e) => setSelectedcar(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          {Array.from({ length: 12 }, (_, i) => `B${i + 1}`).map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* ป้อนค่าแต่ละ Node */}
      <div className="mb-4">
        <h3 className="text-md font-semibold">ค่าของ Node ที่เลือก:</h3>
        {selectedNodeIds.map((id) => (
          <div key={id} className="flex items-center gap-2 mb-2">
            <span>Node {id} - value:</span>
            <input
              type="text"
              value={nodeValues[id] || ""}
              onChange={(e) => handleValueChange(id, e.target.value)}
              className="p-2 border border-gray-300 rounded w-32"
            />
            <Button variant="destructive" onClick={() => handleRemoveNode(id)}>
              ลบ
            </Button>
          </div>
        ))}
      </div>

      {/* ปุ่มอัปเดต */}
      <Button onClick={handleUpdate} className="mb-6">
        อัปเดต Node ที่เลือก
      </Button>

      {/* เลือกบ้านเรือใหม่ */}
      {/* เพิ่มเรือหลายลำไปยัง Node ที่เลือก */}
<div className="mb-6">
  <h3 className="text-md font-semibold mb-2">เพิ่มเรือหลายลำไปยัง Node ที่เลือก:</h3>

  {/* เลือก Node ที่จะเพิ่มเรือ */}
  <div className="mb-4 flex items-center gap-2">
    <span>เลือก Node:</span>
    <select
      value={selectedNode}
      onChange={(e) => setSelectedNode(e.target.value)}
      className="p-2 border border-gray-300 rounded"
    >
      <option value="">-- เลือก Node --</option>
      {nodes.map((node) => (
        <option key={node.id} value={node.id}>
          Node {node.id}
        </option>
      ))}
    </select>
  </div>

  {/* แสดงเรือที่มีอยู่แล้วใน Node */}
  {selectedNode && (
    <div className="mb-4 text-sm">
      <strong>เรือที่มีอยู่แล้วใน Node {selectedNode}:</strong>{" "}
      {
        nodes.find((n) => n.id === selectedNode)?.ship?.map((s: string, idx: number) => (
          <span key={idx} className="mr-2">
            {s}
          </span>
        )) ?? "ไม่มีเรือ"
      }
    </div>
  )}

  {/* เลือกบ้านเรือใหม่ที่จะเพิ่ม */}
  {newShips.map((ship, index) => (
    <div key={index} className="flex items-center gap-2 mb-2">
      <select
        value={ship.house}
        onChange={(e) => handleNewShipChange(index, e.target.value)}
        className="p-2 border border-gray-300 rounded"
      >
        {Array.from({ length: 12 }, (_, i) => `B${i + 1}`).map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => removeNewShipField(index)}
      >
        ลบลำนี้
      </Button>
    </div>
  ))}
  <Button className="mt-2 mr-2" onClick={addNewShipField}>
    ➕ เพิ่มเรือ
  </Button>

  <Button
    onClick={() => selectedNode && addShips(selectedNode)}
    disabled={!selectedNode || newShips.length === 0}
    className="mt-2"
  >
    ✅ เพิ่มเรือไปยัง Node {selectedNode}
  </Button>
</div>

      {/* รายการ Node */}
      {/* <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">รายการ Nodes:</h3>
        <ul className="space-y-2">
          {nodes.map((node) => (
            <li key={node.id} className="border p-2 rounded">
              <div>
                <strong>ID:</strong> {node.id}, <strong>selectedcar:</strong>{" "}
                {node.selectedcar}, <strong>value:</strong> {node.value}
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                <Button
                  size="sm"
                  onClick={() => toggleField(node.id, "tower", node.tower)}
                >
                  {node.tower ? "🔒 ปิด Tower" : "🔓 เปิด Tower"}
                </Button> */}
                {/* <Button
                  size="sm"
                  onClick={() => toggleField(node.id, "bost", node.bost)}
                >
                  {node.bost ? "🚫 ปิด Bost" : "✅ เปิด Bost"}
                </Button> */}
                {/* <Button
                  size="sm"
                  onClick={() => addShips(node.id)}
                  disabled={newShips.length === 0}
                >
                  ➕ เพิ่มเรือที่เลือก
                </Button>
              </div>
              {node.ship && node.ship.length > 0 && (
                <div className="mt-2 text-sm">
                  🚢 เรือ:
                  {node.ship.map((s: string, idx: number) => (
                    <span key={idx} className="mr-2">
                      {s}{" "}
                      <button
                        onClick={() => removeShip(node.id, idx)}
                        className="text-red-500 text-xs"
                      >
                        [ลบ]
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))} */}
        {/* </ul> */}
      {/* </div> */}
      <div className="mt-6">
        <h3 className="text-md mb-2">รายการ Nodes:</h3>
        <ul className="space-y-1">
          {nodes.map((node) => (
            <li key={node.id} className="flex items-center gap-4">
              <span>
                ID: {node.id}, selectedcar: {node.selectedcar}, value:{" "}
                {node.value}, tower: {node.tower ? "✅" : "❌"}
              </span>
              <Button
                onClick={() => toggleTower(node.id, node.tower)}
                className="text-xs"
              >
                {node.tower ? "ปิด Tower" : "เปิด Tower"}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
