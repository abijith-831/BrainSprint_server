import { IProblem } from "../../models/user/problemModel";
import { ProblemRepositories } from "../../repositories/implementation/ProblemRepository";
import axios from "axios";

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

  async getProblems(): Promise<{
    success: boolean;
    message: string;
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

  // Modified testProblem method with pass/fail checking

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
        const numsMatch = tc.input.match(/nums\s*=\s*(\[[^\]]*\])/);
        const targetMatch = tc.input.match(/target\s*=\s*(\d+)/);
      
        const nums = numsMatch ? JSON.parse(numsMatch[1]) : [];
        const target = targetMatch ? Number(targetMatch[1]) : 0;
      
        console.log("nums:", nums, "target:", target);

        const finalCode = `
        ${payload.code}
      
        console.log(twoSum(${JSON.stringify(nums)}, ${target}));
        `;
        
        try {
          const response = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
            {
              source_code: finalCode,
              language_id: languageId,
              stdin: tc.input,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              },
            }
          );


          

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
