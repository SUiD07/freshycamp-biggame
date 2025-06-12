"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { NodeTableView } from "./NodeTableView";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export type Node = {
  id: string;
  top: string | null;
  left: string | null;
  value: string | null;
  selectedcar: string | null;
  tower: boolean | null;
  ship: string[] | null;
  fight: any[] | null;
  towerOwner: string | null;
};

export default function NodesTable() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNodes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("nodes").select("*").order("id");
    if (error) {
      console.error("Error fetching nodes:", error);
    } else {
      setNodes(data || []);
    }
    setLoading(false);
  };

  const handleCopy = (data: Node[] | Node) => {
    let textToCopy = "";

    const dataArray = Array.isArray(data) ? data : [data];

    textToCopy +=
      [
        "id",
        "top",
        "left",
        "value",
        "selectedcar",
        "tower",
        "ship",
        "fight",
        "towerOwner",
      ].join("\t") + "\n";

    dataArray.forEach((item) => {
      textToCopy +=
        [
          item.id,
          item.top ?? "",
          item.left ?? "",
          item.value ?? "",
          item.selectedcar ?? "",
          item.tower === true ? "true" : "false",
          item.ship?.join(", ") ?? "",
          (item.fight?.length ?? 0).toString(),
          item.towerOwner ?? "",
        ].join("\t") + "\n";
    });

    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("Copied in Excel format!");
    });
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button onClick={fetchNodes} disabled={loading}>
          {loading ? "Loading..." : "🔄 Fetch Data"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleCopy(nodes)}
          disabled={nodes.length === 0}
        >
          <Copy className="w-4 h-4 mr-1" /> Copy All
        </Button>
      </div>

      <NodeTableView nodes={nodes} onCopyRow={handleCopy} />
    </div>
  );
}
