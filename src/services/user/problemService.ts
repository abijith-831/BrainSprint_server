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

  async testProblem(payload: TestProblemPayload): Promise<{
    success: boolean;
    message: string;
    results?: { input: string; expected: string; actual: string }[];
  }> {
    try {
      const languageMap: Record<string, number> = {
        javascript: 63, // Node.js 12
        python: 71, // Python 3
        java: 62, // Java 17
        cpp: 54, // C++ (GCC 9.2)
      };

      const languageId = languageMap[payload.language.toLowerCase()];
      if (!languageId) {
        return {
          success: false,
          message: `Unsupported language: ${payload.language}`,
        };
      }

      // Extract test cases from description
      const testCases = this.parseTestCasesFromDescription(payload.description);
      if (testCases.length === 0) {
        return { success: false, message: "No test cases found in problem description" };
      }

      // Run all test cases
      const results = [];
      for (const tc of testCases) {
        const response = await axios.post(
          "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
          {
            source_code: payload.code,
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

        const actualOutput = (response.data.stdout || response.data.stderr || "").trim();

        results.push({
          input: tc.input,
          expected: tc.output,
          actual: actualOutput,
        });
      }

      return {
        success: true,
        message: "Code tested successfully",
        results,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to test problem" };
    }
  }
}
