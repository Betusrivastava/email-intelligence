import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ExtractedOrganizationData {
  name: string;
  location: string;
  owners: string;
  activities: string;
  age: number;
  website: string;
  industry: string;
}

function extractWithPattern(emailContent: string): ExtractedOrganizationData {
  const text = emailContent.toLowerCase();
  
  // Extract company name (look for common patterns)
  let name = "";
  const namePatterns = [
    /(?:from|at|with)\s+([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Company|Solutions|Technologies|Systems|Group))/i,
    /([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Company|Solutions|Technologies|Systems|Group))/i,
    /(?:I'm|I am).*(?:from|at|with)\s+([A-Z][a-zA-Z\s&]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = emailContent.match(pattern);
    if (match && match[1]) {
      name = match[1].trim();
      break;
    }
  }
  
  // Extract location
  let location = "";
  const locationPattern = /(?:based in|located in|from)\s+([A-Z][a-zA-Z\s,]+(?:CA|NY|TX|FL|WA|OR|MA|USA|United States))/i;
  const locationMatch = emailContent.match(locationPattern);
  if (locationMatch) {
    location = locationMatch[1].trim();
  }
  
  // Extract website
  let website = "";
  const websitePattern = /(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const websiteMatch = emailContent.match(websitePattern);
  if (websiteMatch) {
    website = websiteMatch[1];
  }
  
  // Extract owners/leadership
  let owners = "";
  const ownerPatterns = [
    /(?:founded by|co-founder|CEO|CTO|founder)\s*:?\s*([A-Z][a-zA-Z\s,&]+)/gi,
    /([A-Z][a-zA-Z\s]+)\s*\([^)]*(?:CEO|CTO|founder|co-founder|president)[^)]*\)/gi
  ];
  
  const ownerMatches = [];
  for (const pattern of ownerPatterns) {
    let match;
    while ((match = pattern.exec(emailContent)) !== null) {
      ownerMatches.push(match[1].trim());
    }
  }
  owners = ownerMatches.slice(0, 3).join(", ");
  
  // Extract age
  let age = 0;
  const agePatterns = [
    /(\d+)\s*years?\s*(?:old|in business|in operation)/i,
    /founded in\s*(\d{4})/i,
    /established\s*(\d{4})/i,
    /since\s*(\d{4})/i
  ];
  
  for (const pattern of agePatterns) {
    const match = emailContent.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      if (year > 1900 && year < 2030) {
        age = 2025 - year;
      } else if (year < 100) {
        age = year;
      }
      break;
    }
  }
  
  // Extract industry and activities
  let industry = "";
  let activities = "";
  
  if (text.includes("software") || text.includes("tech") || text.includes("ai") || text.includes("development")) {
    industry = "Technology";
    activities = "Software development, technology solutions";
  } else if (text.includes("healthcare") || text.includes("medical") || text.includes("health")) {
    industry = "Healthcare";
    activities = "Healthcare services, medical solutions";
  } else if (text.includes("manufacturing") || text.includes("production")) {
    industry = "Manufacturing";
    activities = "Manufacturing, production services";
  } else if (text.includes("consulting") || text.includes("advisory")) {
    industry = "Consulting";
    activities = "Consulting services, advisory";
  } else {
    industry = "Business Services";
    activities = "Professional services";
  }
  
  return {
    name: name || "Organization Name",
    location: location || "",
    owners: owners || "",
    activities: activities,
    age: age,
    website: website || "",
    industry: industry
  };
}

export async function extractOrganizationFromEmail(emailContent: string): Promise<ExtractedOrganizationData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting structured organization data from email content. Always respond with valid JSON."
        },
        {
          role: "user",
          content: `Extract organization information from this email and respond with JSON containing: name, location, owners, activities, age (number), website, industry.\n\nEmail: ${emailContent}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      name: result.name || "",
      location: result.location || "",
      owners: result.owners || "",
      activities: result.activities || "",
      age: parseInt(result.age) || 0,
      website: result.website || "",
      industry: result.industry || "",
    };
  } catch (error) {
    console.error("OpenAI extraction error:", error);
    
    // Fallback to pattern-based extraction when OpenAI fails
    console.log("Using fallback pattern-based extraction");
    return extractWithPattern(emailContent);
  }
}
