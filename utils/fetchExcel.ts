import * as XLSX from "xlsx";
import axios from "axios";

export const fetchExcelData = async () => {
const url = "https://onedrive.live.com/download?resid=2C7AD9E40316D111!560077";
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const data = new Uint8Array(response.data);
  const workbook = XLSX.read(data, { type: "array" });

  const sheet = workbook.Sheets["round 1"];
  if (!sheet) throw new Error("Sheet 'round 1' not found");

  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const headers = jsonData[0] as string[];
  const colIndexes = ["pp", "landlord", "FORTESS"].map(name => headers.indexOf(name));
  if (colIndexes.includes(-1)) throw new Error("One or more column headers not found");

  const extractedData = jsonData.slice(1).map(row => ({
    pp: (row as any)[colIndexes[0]]?.toString() ?? "",
    landlord: (row as any)[colIndexes[1]]?.toString() ?? "",
    FORTESS: (row as any)[colIndexes[2]]?.toString() ?? ""
  })).filter(row => row.pp); // ตัด row ว่าง

  return extractedData;
};
