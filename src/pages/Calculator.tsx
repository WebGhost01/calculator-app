import { useState, useCallback } from "react";

type ButtonConfig = {
  label: string;
  value: string;
  type: "number" | "operator" | "action" | "equals";
  wide?: boolean;
};

const buttons: ButtonConfig[] = [
  { label: "AC", value: "AC", type: "action" },
  { label: "+/-", value: "+/-", type: "action" },
  { label: "%", value: "%", type: "action" },
  { label: "÷", value: "/", type: "operator" },
  { label: "7", value: "7", type: "number" },
  { label: "8", value: "8", type: "number" },
  { label: "9", value: "9", type: "number" },
  { label: "×", value: "*", type: "operator" },
  { label: "4", value: "4", type: "number" },
  { label: "5", value: "5", type: "number" },
  { label: "6", value: "6", type: "number" },
  { label: "−", value: "-", type: "operator" },
  { label: "1", value: "1", type: "number" },
  { label: "2", value: "2", type: "number" },
  { label: "3", value: "3", type: "number" },
  { label: "+", value: "+", type: "operator" },
  { label: "0", value: "0", type: "number", wide: true },
  { label: ".", value: ".", type: "number" },
  { label: "=", value: "=", type: "equals" },
];

function formatDisplay(value: string): string {
  if (value.length > 12) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num.toExponential(4);
    }
  }
  return value;
}

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [firstOperand, setFirstOperand] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);

  const handleNumber = useCallback(
    (value: string) => {
      if (waitingForSecond) {
        setDisplay(value === "." ? "0." : value);
        setWaitingForSecond(false);
      } else {
        if (value === "." && display.includes(".")) return;
        setDisplay(display === "0" && value !== "." ? value : display + value);
      }
    },
    [display, waitingForSecond]
  );

  const handleOperator = useCallback(
    (op: string) => {
      if (operator && !waitingForSecond) {
        const result = calculate(firstOperand!, display, operator);
        setDisplay(formatDisplay(String(result)));
        setFirstOperand(String(result));
        setExpression(`${formatDisplay(String(result))} ${symbolFor(op)}`);
      } else {
        setFirstOperand(display);
        setExpression(`${formatDisplay(display)} ${symbolFor(op)}`);
      }
      setOperator(op);
      setWaitingForSecond(true);
    },
    [display, operator, firstOperand, waitingForSecond]
  );

  const handleEquals = useCallback(() => {
    if (!operator || !firstOperand) return;
    const result = calculate(firstOperand, display, operator);
    setExpression(`${formatDisplay(firstOperand)} ${symbolFor(operator)} ${formatDisplay(display)} =`);
    setDisplay(formatDisplay(String(result)));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
  }, [display, operator, firstOperand]);

  const handleAction = useCallback(
    (action: string) => {
      if (action === "AC") {
        setDisplay("0");
        setExpression("");
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecond(false);
      } else if (action === "+/-") {
        setDisplay(String(parseFloat(display) * -1));
      } else if (action === "%") {
        setDisplay(String(parseFloat(display) / 100));
      }
    },
    [display]
  );

  const handlePress = useCallback(
    (btn: ButtonConfig) => {
      if (btn.type === "number") handleNumber(btn.value);
      else if (btn.type === "operator") handleOperator(btn.value);
      else if (btn.type === "equals") handleEquals();
      else if (btn.type === "action") handleAction(btn.value);
    },
    [handleNumber, handleOperator, handleEquals, handleAction]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="w-80 rounded-3xl overflow-hidden shadow-2xl bg-black">
        <div className="px-6 pt-8 pb-4 flex flex-col items-end">
          <div className="text-zinc-500 text-sm h-5 font-light tracking-wide truncate w-full text-right">
            {expression || ""}
          </div>
          <div
            className="text-white text-5xl font-light mt-1 tracking-tight w-full text-right truncate"
            style={{ fontSize: display.length > 9 ? "2rem" : undefined }}
          >
            {formatDisplay(display)}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 p-4">
          {buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => handlePress(btn)}
              className={[
                "h-16 rounded-full text-lg font-medium transition-all duration-100 active:scale-95 select-none cursor-pointer",
                btn.wide ? "col-span-2" : "",
                btn.type === "action"
                  ? "bg-zinc-500 hover:bg-zinc-400 text-black"
                  : btn.type === "operator"
                  ? "bg-amber-500 hover:bg-amber-400 text-white"
                  : btn.type === "equals"
                  ? "bg-amber-500 hover:bg-amber-400 text-white"
                  : "bg-zinc-700 hover:bg-zinc-600 text-white",
              ].join(" ")}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function symbolFor(op: string): string {
  const map: Record<string, string> = {
    "/": "÷",
    "*": "×",
    "-": "−",
    "+": "+",
  };
  return map[op] ?? op;
}

function calculate(a: string, b: string, op: string): number {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  switch (op) {
    case "+": return numA + numB;
    case "-": return numA - numB;
    case "*": return numA * numB;
    case "/": return numB !== 0 ? numA / numB : NaN;
    default: return numB;
  }
}
