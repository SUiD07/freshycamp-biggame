"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function NodeUpdater() {
  const supabase = createClient();
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedcar, setSelectedcar] = useState<string>("B1");
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [nodeValues, setNodeValues] = useState<Record<string, string>>({});

  const fetchNodes = async () => {
    const { data, error } = await supabase.from("nodes").select("*");
    if (error) console.error("Fetch error:", error);
    else setNodes(data);
  };

  useEffect(() => {
    fetchNodes();
  }, []);

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

  const handleValueChange = (nodeId: string, newValue: string) => {
    setNodeValues((prev) => ({
      ...prev,
      [nodeId]: newValue,
    }));
  };
  // Toggle tower ของ node
  const toggleTower = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("nodes")
      .update({ tower: !currentValue })
      .eq("id", id);
    if (error) console.error("Toggle tower error:", error);
    else fetchNodes();
  };

  return (
    <div className="p-4">
      <h2 className="text-lg mb-4">Node Updater</h2>

      <div className="mb-4">
        <label htmlFor="node-select" className="block mb-2">
          เลือก Node ที่จะอัปเดต:
        </label>
        <div className="flex gap-2 mb-4">
          <select
            id="node-select"
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">-- เลือก Node --</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                Node {node.id} - {node.selectedcar}
              </option>
            ))}
          </select>
          <Button onClick={handleAddNode}>เพิ่ม</Button>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="car-select" className="block mb-2">
          เลือก SelectedCar ที่จะอัปเดต:
        </label>
        <select
          id="car-select"
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

      <div className="mb-4">
        <h3>ค่าของ Node ที่เลือก:</h3>
        {selectedNodeIds.map((id) => (
          <div key={id} className="flex items-center gap-2 mb-2">
            <span>Node {id} - value:</span>
            <input
              type="text"
              value={nodeValues[id] || ""}
              onChange={(e) => handleValueChange(id, e.target.value)}
              className="p-2 border border-gray-300 rounded w-32"
              placeholder="Enter value"
            />
            <Button variant="destructive" onClick={() => handleRemoveNode(id)}>
              ลบ
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleUpdate}>อัปเดต Node ที่เลือก</Button>

      <div className="mt-6">
        <h3 className="text-md mb-2">Node ที่เลือก:</h3>
        <ul className="space-y-1">
          {selectedNodeIds.map((id) => (
            <li key={id}>Node {id}</li>
          ))}
        </ul>
      </div>
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
