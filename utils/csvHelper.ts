
export const generateCSVTemplate = (headers: string[], filename: string) => {
  // Add BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";
  const csvContent = bom + headers.join(",") + "\n";
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        resolve([]);
        return;
      }

      const lines = text.split(/\r\n|\n/);
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));
      
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Handle quotes if necessary, simplified split for now
        const values = line.split(",").map(v => v.trim().replace(/"/g, ''));
        
        if (values.length === headers.length) {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          result.push(obj);
        }
      }
      resolve(result);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
