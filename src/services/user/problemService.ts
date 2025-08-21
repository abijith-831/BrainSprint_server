import { IProblem } from "../../models/user/problemModel";
import { ProblemRepositories } from "../../repositories/implementation/ProblemRepository";
import axios from "axios";
import OpenAI from "openai";
import "dotenv/config";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TestProblemPayload {
  code: string;
  language: string;
  title: string;
  description: string;
}

interface ExampleTestCase {
  input: string;
  output: string;
  explanation?: string;
}

export class ProblemService {
  private problemRepositories: ProblemRepositories;

  constructor() {
    this.problemRepositories = new ProblemRepositories();
  }

  // Parse test cases from description
  private parseTestCasesFromDescription(description: string): ExampleTestCase[] {
    const exampleRegex =
      /Example\s*\d*:\s*Input:\s*(.*?)\s*Output:\s*(.*?)\s*(?:Explanation:\s*(.*?))?(?=Example|\nConstraints|$)/gs;

    const testCases: ExampleTestCase[] = [];
    let match;

    while ((match = exampleRegex.exec(description)) !== null) {
      testCases.push({
        input: match[1]?.trim() || "",
        output: match[2]?.trim() || "",
        explanation: match[3]?.trim() || undefined,
      });
    }

    return testCases;
  }

  async getProblems(): Promise<{ success: boolean; message: string;
    data?: (IProblem & { testCases: ExampleTestCase[] })[];
  }> {
    try {
      const problems = await this.problemRepositories.getAllProblems();

      if (!problems || problems.length === 0) {
        return { success: false, message: "No problems found" };
      }

      // Attach parsed test cases to each problem
      const problemsWithTestCases = problems.map((p) => ({
        ...(p.toObject?.() ?? p), // Handle mongoose docs
        testCases: this.parseTestCasesFromDescription(p.description),
      }));

      return {
        success: true,
        message: "Problems fetched successfully",
        data: problemsWithTestCases,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch problems" };
    }
  }

async testProblem(payload: TestProblemPayload): Promise<{
  success: boolean;
  message: string;
  results?: { 
    input: string; 
    expected: string; 
    actual: string; 
    passed: boolean;
    error?: string;
  }[];
  summary?: {
    totalTests: number;
    passed: number;
    failed: number;
    allPassed: boolean;
  };
}> {
  try {
    const languageMap: Record<string, number> = {
      javascript: 63, 
      python: 71, 
      java: 62,
      cpp: 54, 
    };

    console.log('code',payload.code);
    

    const languageId = languageMap[payload.language.toLowerCase()];
    if (!languageId) {
      return {
        success: false,
        message: `Unsupported language: ${payload.language}`,
      };
    }

    const testCases = this.parseTestCasesFromDescription(payload.description);
    if (testCases.length === 0) {
      return { success: false, message: "No test cases found in problem description" };
    }
    
    const results = [];
    let passedCount = 0;

    
    for (const tc of testCases) {

      const consoleLogCall = await generateConsoleLogCall("twoSum", tc.input, payload.language);

      const finalCode = `
      ${payload.code}
      
      ${consoleLogCall}
      `;

        try {
          const response = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
            {
              source_code: finalCode,
              language_id: languageId,
              
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              },
            }
          );

          console.log('resss',response);
          


          

        const actualOutput = (response.data.stdout || "").trim();
        const expectedOutput = tc.output.trim();
        
        const hasError = response.data.stderr && response.data.stderr.trim() !== "";
        const compilationError = response.data.compile_output && response.data.compile_output.trim() !== "";
        
        const normalize = (str: string) => str.split("\n")[0].replace(/\s+/g, '');
        const passed = !hasError && !compilationError && normalize(actualOutput) === normalize(expectedOutput);
        
        if (passed) {
          passedCount++;
        }

        results.push({
          input: tc.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed: passed,
          error: hasError ? response.data.stderr : (compilationError ? response.data.compile_output : undefined)
        });
        
        
      } catch (error:any) {
        console.error("Judge0 request failed:", error.response?.status, error.response?.data || error.message);
        results.push({
          input: tc.input,
          expected: tc.output.trim(),
          actual: "",
          passed: false,
          error: `Execution error: ${error.message || 'Unknown error'}`
        });
      }
    }

    const summary = {
      totalTests: testCases.length,
      passed: passedCount,
      failed: testCases.length - passedCount,
      allPassed: passedCount === testCases.length
    };
    
    console.log('results',results);
    console.log('summary',summary);
    
    
    return {
      success: true,
      message: `Code tested successfully. ${passedCount}/${testCases.length} tests passed.`,
      results,
      summary
    };
    
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to test problem" };
  }
}


}

async function generateConsoleLogCall(
  functionName: string,
  testCaseInput: string,
  language: string
): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = `
  You are a helper that generates test case invocations in ${language}.
  Function name: ${functionName}
  Test case input: ${testCaseInput}

  Rules:
  - Output only ONE line of code.
  - The line must be a console.log() calling the function with parsed arguments.
  - Example: console.log(twoSum([2,7,11,15], 9));
  - Do NOT include explanations, comments, imports, or extra text.
  - Do NOT wrap code in backticks.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You generate exact function calls for test cases." },
      { role: "user", content: prompt }
    ],
    temperature: 0,
  });

  console.log('');
  

  return completion.choices[0].message.content?.trim() || "";
}

