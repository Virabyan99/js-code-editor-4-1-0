export function evaluateCode(code: string): string[] {
    const results: string[] = [];
  
    // Custom console.log to capture outputs
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      results.push(args.join(" "));
      originalConsoleLog(...args); // Still log to browser console
    };
  
    try {
      // Evaluate the code
      const evalResult = eval(code);
  
      // Capture return value if any
      if (evalResult !== undefined) {
        results.push(String(evalResult));
      }
    } catch (error: any) {
      // Capture errors
      results.push(`Error: ${error.message}`);
    }
  
    // Restore original console.log
    console.log = originalConsoleLog;
  
    return results;
  }
  