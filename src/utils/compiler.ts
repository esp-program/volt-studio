import { MicroBoard, ArduinoLibrary, SketchFile, CompilationResult } from '../types/ide';

export function compileSketch(
  files: SketchFile[],
  board: MicroBoard,
  libraries: ArduinoLibrary[]
): CompilationResult {
  const logs: string[] = [];
  const entryFile = files.find(f => f.isEntry) || files[0];
  const headerFiles = files.filter(f => f.name.endsWith('.h'));
  const cppFiles = files.filter(f => f.name.endsWith('.cpp') || (f.name.endsWith('.ino') && f !== entryFile));

  logs.push(`[VoltIDE Toolchain] Initializing compilation for ${board.name} (${board.architecture})`);
  logs.push(`Target MCU: ${board.mcu} @ ${board.clockSpeed}`);
  logs.push(`Source files: ${files.map(f => f.name).join(', ')}`);

  // Step 1: Preprocessor & Combined Translation Unit Assembly
  logs.push(`\n[Preprocessor Pass] Resolving and combining project headers & implementation units...`);
  
  let combinedTranslationUnit = '';
  
  // First, combine headers (e.g. config.h)
  headerFiles.forEach(hf => {
    logs.push(`  -> Inlining header: "${hf.name}" (${hf.content.length} bytes)`);
    // Extract defines and declarations
    const defines = (hf.content.match(/#define\s+([a-zA-Z0-9_]+)/g) || []).map(d => d.replace('#define ', ''));
    if (defines.length > 0) {
      logs.push(`     Defined symbols from ${hf.name}: [${defines.join(', ')}]`);
    }
    combinedTranslationUnit += `\n/* === [Header: ${hf.name}] === */\n${hf.content}\n`;
  });

  // Then add entry .ino
  logs.push(`  -> Preprocessing entry sketch: "${entryFile.name}"`);
  combinedTranslationUnit += `\n/* === [Sketch: ${entryFile.name}] === */\n${entryFile.content}\n`;

  // Then add any additional .cpp files
  cppFiles.forEach(cf => {
    logs.push(`  -> Compiling compilation unit: "${cf.name}"`);
    combinedTranslationUnit += `\n/* === [Unit: ${cf.name}] === */\n${cf.content}\n`;
  });

  // Check required entry functions in the combined translation unit
  const hasSetup = /void\s+setup\s*\(\s*\)/.test(combinedTranslationUnit) || /void\s+setup\b/.test(combinedTranslationUnit);
  const hasLoop = /void\s+loop\s*\(\s*\)/.test(combinedTranslationUnit) || /void\s+loop\b/.test(combinedTranslationUnit);

  if (!hasSetup) {
    logs.push(`\n[FATAL ERROR] In file '${entryFile.name}':`);
    logs.push(`error: undefined reference to 'setup()'`);
    logs.push(`Arduino entry point requires 'void setup()' initialization routine.`);
    return {
      success: false,
      flashUsed: 0,
      flashTotal: board.flashBytes,
      sramUsed: 0,
      sramTotal: board.sramBytes,
      logs,
      error: {
        line: 1,
        file: entryFile.name,
        message: "Missing required function 'void setup()'"
      }
    };
  }

  if (!hasLoop) {
    logs.push(`\n[FATAL ERROR] In file '${entryFile.name}':`);
    logs.push(`error: undefined reference to 'loop()'`);
    logs.push(`Arduino entry point requires 'void loop()' main execution loop.`);
    return {
      success: false,
      flashUsed: 0,
      flashTotal: board.flashBytes,
      sramUsed: 0,
      sramTotal: board.sramBytes,
      logs,
      error: {
        line: 1,
        file: entryFile.name,
        message: "Missing required function 'void loop()'"
      }
    };
  }

  // Step 2: Bracket balance verification across individual files
  for (const file of files) {
    let braceCount = 0;
    const lines = file.content.split('\n');
    for (let idx = 0; idx < lines.length; idx++) {
      const l = lines[idx];
      const cleaned = l.replace(/\/\/.*$/, '').replace(/".*?"/g, '');
      for (const char of cleaned) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount < 0) {
          logs.push(`\n[SYNTAX ERROR] ${file.name}:${idx + 1}: unexpected '}' without matching '{'`);
          return {
            success: false,
            flashUsed: 0,
            flashTotal: board.flashBytes,
            sramUsed: 0,
            sramTotal: board.sramBytes,
            logs,
            error: {
              line: idx + 1,
              file: file.name,
              message: "Unmatched closing brace '}'"
            }
          };
        }
      }
    }

    if (braceCount > 0) {
      logs.push(`\n[SYNTAX ERROR] ${file.name}:${lines.length}: expected '}' at end of file. Found unclosed code block.`);
      return {
        success: false,
        flashUsed: 0,
        flashTotal: board.flashBytes,
        sramUsed: 0,
        sramTotal: board.sramBytes,
        logs,
        error: {
          line: lines.length,
          file: file.name,
          message: `Missing ${braceCount} closing brace(s) '}'`
        }
      };
    }
  }

  // Step 3: Check external library includes in combined unit
  const includeRegex = /#include\s+[<"]([a-zA-Z0-9_.]+\.h)[>"]/g;
  let match;
  const standardHeaders = new Set([
    'Arduino.h', 'Wire.h', 'SPI.h', 'EEPROM.h', 'SoftwareSerial.h',
    'WiFi.h', 'WebServer.h', 'WiFiClient.h', 'WiFiServer.h', 'avr/io.h',
    'avr/interrupt.h', 'avr/pgmspace.h', 'math.h', 'stdio.h', 'stdlib.h', 'string.h'
  ]);

  const localHeaders = new Set(headerFiles.map(f => f.name));

  while ((match = includeRegex.exec(combinedTranslationUnit)) !== null) {
    const headerName = match[1];
    if (localHeaders.has(headerName)) {
      logs.push(`  ✓ Linked local project header: "${headerName}" combined into binary.`);
      continue;
    }
    if (standardHeaders.has(headerName)) {
      logs.push(`  ✓ Linked core system header: <${headerName}>`);
      continue;
    }

    // Check if provided by an installed library
    const matchedLib = libraries.find(lib => lib.headers.includes(headerName));
    if (matchedLib) {
      if (!matchedLib.installed) {
        logs.push(`\n[COMPILER ERROR] fatal error: ${headerName}: No such file or directory`);
        logs.push(`Compilation terminated.`);
        logs.push(`💡 HINT: Library '${matchedLib.name}' provides this header but is not installed.`);
        return {
          success: false,
          flashUsed: 0,
          flashTotal: board.flashBytes,
          sramUsed: 0,
          sramTotal: board.sramBytes,
          logs,
          error: {
            line: 1,
            file: entryFile.name,
            message: `Library '${matchedLib.name}' required by <${headerName}> is not installed`
          }
        };
      } else {
        logs.push(`  ✓ Linked external library: ${matchedLib.name} v${matchedLib.version} (<${headerName}>)`);
      }
    } else {
      logs.push(`  ✓ Resolved header: <${headerName}>`);
    }
  }

  // Step 4: Calculate Flash & SRAM footprint of combined unit
  const totalCharacters = files.reduce((acc, f) => acc + f.content.length, 0);
  const baseFlash = Math.min(Math.round(totalCharacters * 1.8 + 2400), board.flashBytes * 0.85);
  const baseSram = Math.min(Math.round(totalCharacters * 0.35 + 280), board.sramBytes * 0.7);

  const flashPercent = ((baseFlash / board.flashBytes) * 100).toFixed(1);
  const sramPercent = ((baseSram / board.sramBytes) * 100).toFixed(1);

  logs.push(`\n[Compiler Pass 1] Preprocessing macros and template instantiations... OK`);
  logs.push(`[Compiler Pass 2] Code generation and dead-code stripping (-Os)... OK`);
  logs.push(`[Linker Pass 3] Linking combined translation units (${files.length} source files) against core.a... OK`);
  logs.push(`[Binary Generator] Built unified firmware binary: firmware.bin / firmware.hex`);
  logs.push(`\n============================================================`);
  logs.push(`Sketch uses ${baseFlash.toLocaleString()} bytes (${flashPercent}%) of program storage space. Maximum is ${board.flashBytes.toLocaleString()} bytes.`);
  logs.push(`Global variables use ${baseSram.toLocaleString()} bytes (${sramPercent}%) of dynamic memory, leaving ${(board.sramBytes - baseSram).toLocaleString()} bytes for local variables. Maximum is ${board.sramBytes.toLocaleString()} bytes.`);
  logs.push(`============================================================`);
  logs.push(`✓ Compilation complete: config.h & C++ translation units successfully merged and compiled with ZERO errors.`);

  return {
    success: true,
    flashUsed: baseFlash,
    flashTotal: board.flashBytes,
    sramUsed: baseSram,
    sramTotal: board.sramBytes,
    logs
  };
}

/**
 * Utility to generate the combined/merged C++ translation unit
 * from config.h, helper headers, and main.ino
 */
export function generateCombinedCode(files: SketchFile[]): string {
  const headerFiles = files.filter(f => f.name.endsWith('.h'));
  const entryFile = files.find(f => f.isEntry) || files[0];
  const cppFiles = files.filter(f => f !== entryFile && !f.name.endsWith('.h'));

  let result = `// ====================================================================\n`;
  result += `// VoltIDE Unified Translation Unit (Combined config.h & C++ Source)\n`;
  result += `// Combined timestamp: ${new Date().toISOString()}\n`;
  result += `// ====================================================================\n\n`;

  headerFiles.forEach(hf => {
    result += `// --------------------------------------------------------------------\n`;
    result += `// [COMBINED HEADER: ${hf.name}]\n`;
    result += `// --------------------------------------------------------------------\n`;
    result += hf.content + `\n\n`;
  });

  if (entryFile) {
    result += `// --------------------------------------------------------------------\n`;
    result += `// [MAIN ENTRY SKETCH: ${entryFile.name}]\n`;
    result += `// --------------------------------------------------------------------\n`;
    result += entryFile.content + `\n\n`;
  }

  cppFiles.forEach(cf => {
    result += `// --------------------------------------------------------------------\n`;
    result += `// [COMPILATION UNIT: ${cf.name}]\n`;
    result += `// --------------------------------------------------------------------\n`;
    result += cf.content + `\n\n`;
  });

  return result;
}
