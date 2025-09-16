/*
  Data structure optimized for algorithms: 9x9 2D array of strings or numbers.
  - Empty cell is "" (empty string)
  - Filled cells contain string digits "1".."9"
*/

let sudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(""));

const gridEl = document.getElementById("sudokuGrid");
const messageEl = document.getElementById("message");
const solveBtn = document.getElementById("solveBtn");
const validateBtn = document.getElementById("validateBtn");
const clearBtn = document.getElementById("clearBtn");
const loadSampleBtn = document.getElementById("loadSample");

/* redirect user to landing page */
function redirect(where){
  setInterval(() => {
		window.location.href = where;
	}, 1000);
}

/* Build the UI inputs and attach attributes for row/col */
function buildUI(){
  gridEl.innerHTML = "";
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.setAttribute("aria-label", `Row ${r+1} Column ${c+1}`);
      input.dataset.row = r;
      input.dataset.col = c;
      input.value = sudokuGrid[r][c] ?? "";
      // Allow only digits 1-9
      input.addEventListener("input", (ev) => {
        const v = ev.target.value.replace(/[^1-9]/g, "");
        ev.target.value = v;
        sudokuGrid[r][c] = v;
      });
      // Arrow navigation
      input.addEventListener("keydown", (ev) => {
        const key = ev.key;
        if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(key)){
          ev.preventDefault();
          let rr = r, cc = c;
          if(key === "ArrowLeft") cc = Math.max(0,c-1);
          if(key === "ArrowRight") cc = Math.min(8,c+1);
          if(key === "ArrowUp") rr = Math.max(0,r-1);
          if(key === "ArrowDown") rr = Math.min(8,r+1);
          const selector = `input[data-row="${rr}"][data-col="${cc}"]`;
          const next = document.querySelector(selector);
          if(next) next.focus();
        }
      });
      gridEl.appendChild(input);
    }
  }
}

/* Read grid data from UI into sudokuGrid */
function readUIIntoGrid(){
  const inputs = gridEl.querySelectorAll("input");
  inputs.forEach(inp => {
    const r = Number(inp.dataset.row);
    const c = Number(inp.dataset.col);
    const v = inp.value.trim();
    sudokuGrid[r][c] = v === "" ? "" : v;
  });
}

/* Write sudokuGrid into UI */
function writeGridToUI(){
  const inputs = gridEl.querySelectorAll("input");
  inputs.forEach(inp => {
    const r = Number(inp.dataset.row);
    const c = Number(inp.dataset.col);
    inp.value = sudokuGrid[r][c] ?? "";
  });
}

/* Validation helpers */
function canPlace(grid, r, c, num){
  for(let i=0;i<9;i++){
    if(grid[r][i] === num) return false;
    if(grid[i][c] === num) return false;
  }
  const br = Math.floor(r/3)*3;
  const bc = Math.floor(c/3)*3;
  for(let i=0;i<3;i++){
    for(let j=0;j<3;j++){
      if(grid[br+i][bc+j] === num) return false;
    }
  }
  return true;
}

function validateGrid(grid){
  const problems = [];
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const v = grid[r][c];
      if(v === "" || v == null) continue;
      grid[r][c] = "";
      if(!canPlace(grid, r, c, v)){
        problems.push({ r, c, msg: `Conflict at row ${r+1}, col ${c+1} (${v})`});
      }
      grid[r][c] = v;
    }
  }
  return { valid: problems.length === 0, problems };
}

/* Backtracking solver */
function solveBacktrack(grid){
  let rr=-1, cc=-1;
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(grid[r][c] === "" || grid[r][c] == null){
        rr=r; cc=c;
        r=9; break;
      }
    }
  }
  if(rr===-1) return true;

  for(let n=1;n<=9;n++){
    const s = String(n);
    if(canPlace(grid, rr, cc, s)){
      grid[rr][cc] = s;
      if(solveBacktrack(grid)) return true;
      grid[rr][cc] = "";
    }
  }
  return false;
}

/* UI actions */
solveBtn.addEventListener("click", () => {
  readUIIntoGrid();
  const valid = validateGrid(sudokuGrid);
  if(!valid.valid){
    messageEl.innerHTML = `<span class="err">Grid invalid — cannot solve. First conflict: ${valid.problems[0].msg}</span>`;
    highlightProblems(valid.problems);
    return;
  }
  const gridCopy = sudokuGrid.map(r => r.slice());
  if(!solveBacktrack(gridCopy)){
    messageEl.innerHTML = `<span class="err">No solution found for this grid.</span>`;
    return;
  }
  sudokuGrid = gridCopy;
  writeGridToUI();
  messageEl.innerHTML = `<span class="ok">Solved ✔</span>`;
  clearHighlights();
});

validateBtn.addEventListener("click", () => {
  readUIIntoGrid();
  const res = validateGrid(sudokuGrid);
  if(res.valid){
    messageEl.innerHTML = `<span class="ok">Valid so far — no conflicts detected.</span>`;
    clearHighlights();
  } else {
    messageEl.innerHTML = `<span class="err">Invalid: ${res.problems.length} conflict(s). Showing first.</span>`;
    highlightProblems(res.problems);
  }
});

clearBtn.addEventListener("click", () => {
  sudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(""));
  writeGridToUI();
  messageEl.textContent = "Cleared.";
  clearHighlights();
});

loadSampleBtn.addEventListener("click", () => {
  const sample = [
  ["5","3","","","7","","","",""],
  ["6","","","1","9","5","","",""],
  ["","9","8","","","","","6",""],
  ["8","","","","6","","","","3"],
  ["4","","","8","","3","","","1"],
  ["7","","","","2","","","","6"],
  ["","6","","","","","2","8",""],
  ["","","","4","1","9","","","5"],
  ["","","","","8","","","7","9"]
];
  sudokuGrid = sample.map(r => r.slice());
  writeGridToUI();
  messageEl.textContent = "Loaded sample puzzle.";
  clearHighlights();
});

/* Visual helpers */
function highlightProblems(problems){
  clearHighlights();
  problems.slice(0, 30).forEach(p => {
    const sel = `input[data-row="${p.r}"][data-col="${p.c}"]`;
    const inp = document.querySelector(sel);
    if(inp){
      inp.style.boxShadow = "0 0 0 4px rgba(239,68,68,0.12)";
      inp.style.borderColor = "rgba(239,68,68,0.9)";
    }
  });
}

function clearHighlights(){
  gridEl.querySelectorAll("input").forEach(inp => {
    inp.style.boxShadow = "";
    inp.style.borderColor = "";
  });
}

/* --- Import / Export system --- */
(function setupFileIO() {
  const controls = document.querySelector(".controls");

  // Format selector
  const select = document.createElement("select");
  ["TXT", "CSV", "JSON"].forEach(fmt => {
    const opt = document.createElement("option");
    opt.value = fmt;
    opt.textContent = fmt;
    select.appendChild(opt);
  });

  // Export button
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export";

  // Import button + hidden file input
  const importBtn = document.createElement("button");
  importBtn.textContent = "Import";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".txt,.csv,.json";
  fileInput.style.display = "none";

  // Append controls
  controls.append(select, exportBtn, importBtn, fileInput);

  // --- Export logic ---
  exportBtn.addEventListener("click", () => {
    const fmt = select.value;
    let content = "";

    if (fmt === "TXT") {
      // Use "." for empty cells
      content = sudokuGrid.map(row => row.map(v => v || ".").join("")).join("\n");
    } else if (fmt === "CSV") {
      content = sudokuGrid.map(row => row.map(v => v || ".").join(",")).join("\n");
    } else if (fmt === "JSON") {
      content = JSON.stringify({ grid: sudokuGrid });
    }

    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sudoku.${fmt.toLowerCase()}`;
    a.dispatchEvent(new MouseEvent("click"));
    URL.revokeObjectURL(a.href);
  });

  // --- Import logic ---
  importBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const text = await file.text();
    let loadedGrid = null;

    try {
      if (file.name.endsWith(".json")) {
        const json = JSON.parse(text);
        if (json.grid && Array.isArray(json.grid) && json.grid.length === 9) {
          loadedGrid = json.grid.map(r => r.map(v => v ? String(v) : ""));
        }
      } else if (file.name.endsWith(".csv")) {
        loadedGrid = text.trim().split("\n").map(line => line.split(",").map(v => v === "." ? "" : v));
      } else if (file.name.endsWith(".txt")) {
        loadedGrid = text.trim().split("\n").map(line => line.trim().split("").map(v => v === "." ? "" : v));
      }
    } catch (err) {
      alert("Failed to parse file: " + err.message);
      return;
    }

    if (!loadedGrid || loadedGrid.length !== 9 || loadedGrid.some(r => r.length !== 9)) {
      alert("Invalid Sudoku file: grid not 9x9");
      return;
    }

    // Copy into sudokuGrid
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        sudokuGrid[r][c] = loadedGrid[r][c] || "";
      }
    }

    writeGridToUI();
    messageEl.textContent = `Loaded puzzle from ${file.name}`;
    fileInput.value = ""; // reset
    clearHighlights();
  });
})();

/* Initialize */
buildUI();
messageEl.textContent = "Enter digits 1–9 or load a sample. Use Solve to auto-fill.";
