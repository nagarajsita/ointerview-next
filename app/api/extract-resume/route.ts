const getDownloadLink = (driveUrl: string) => {
    const match = driveUrl.match(/\/d\/(.*?)\//);
    return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : null;
  };
  
  function parseTextToJSON(text: string) {
    const sections: { [key: string]: string } = {};
    let currentSection: string | null = null;
  
    // Split text by new lines
    const lines = text.split("\n");
  
    lines.forEach((line) => {
      line = line.trim();
  
      if (!line) return; // Skip empty lines
  
      // Detect section headings (like EDUCATION, PROJECTS)
      if (/^[A-Z\s]+[A-Z][a-z]?$/.test(line) && line.length < 30) {
        currentSection = line;
        sections[currentSection] = "";
      } else if (currentSection) {
        sections[currentSection] += ` ${line}`;
      }
    });
  
    // Convert lists to structured JSON
    Object.keys(sections).forEach((key) => {
      sections[key] = sections[key].replace(/\s+/g, " ").trim();
    });
   

    return sections;
  }
export async function POST(req: Request) {
    try {
      const { driveUrl } = await req.json();
      const downloadUrl = getDownloadLink(driveUrl);
  
      if (!downloadUrl) return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400 });
  
      const formData = new FormData();
      formData.append("url", downloadUrl);
      formData.append("apikey", process.env.OCR_SPACE_API_KEY as string); // Your API Key
      formData.append("OCREngine", "2"); // Best accuracy OCR engine
      formData.append("filetype", "PDF"); // Specify that we're processing a PDF
  
      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      if (data.OCRExitCode !== 1) {
        return new Response(JSON.stringify({ error: "OCR extraction failed" }), { status: 500 });
      }
  
      const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
      const sectionalised = parseTextToJSON(extractedText);
      return new Response(JSON.stringify({ text: sectionalised }), { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {

      return new Response(JSON.stringify({ error: "Failed to extract text" }), { status: 500 });
    }
  }
  