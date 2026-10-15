import React, { useState } from 'react';
import { Code2, ChevronDown } from 'lucide-react';

interface Snippet {
  name: string;
  description: string;
  code: string;
}

const SNIPPETS: Snippet[] = [
  {
    name: 'Blink Pin 13',
    description: 'Basic periodic LED toggle with delay',
    code: `// Simple Blink snippet
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
}`
  },
  {
    name: 'Non-blocking Millis Timer',
    description: 'Execute tasks without freezing the MCU with delay()',
    code: `// Non-blocking timer using millis()
unsigned long previousMillis = 0;
const long interval = 500; // interval in milliseconds

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    // Toggle state
    int ledState = digitalRead(LED_BUILTIN);
    digitalWrite(LED_BUILTIN, !ledState);
  }
}`
  },
  {
    name: 'Analog Sensor Read & Map',
    description: 'Read 10-bit ADC and map to percentage 0-100%',
    code: `// Analog ADC Reading & Mapping
const int SENSOR_PIN = A0;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int rawValue = analogRead(SENSOR_PIN);
  // Map 0-1023 to 0-100%
  int percent = map(rawValue, 0, 1023, 0, 100);

  Serial.print("Raw: ");
  Serial.print(rawValue);
  Serial.print(" | Level: ");
  Serial.print(percent);
  Serial.println("%");

  delay(200);
}`
  },
  {
    name: 'I2C Bus Address Scanner',
    description: 'Scans I2C bus (SDA/SCL) for active sensor addresses',
    code: `// I2C Bus Address Scanner
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(115200);
  while (!Serial);
  Serial.println("\\n--- Scanning I2C Bus ---");

  byte error, address;
  int nDevices = 0;

  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);
      Serial.println(" !");
      nDevices++;
    }
  }

  if (nDevices == 0) Serial.println("No I2C devices found\\n");
  else Serial.println("Scan complete.\\n");
}

void loop() {}`
  },
  {
    name: 'ESP32 Wi-Fi Station Mode',
    description: 'Connect to Wi-Fi access point with status logs',
    code: `// ESP32 Wi-Fi Station
#include <WiFi.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  delay(10);

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {}`
  },
  {
    name: 'FreeRTOS Dual Task (ESP32/RP2040)',
    description: 'Spawn two parallel multitasking threads',
    code: `// FreeRTOS Parallel Tasks
void TaskBlink(void *pvParameters);
void TaskSerial(void *pvParameters);

void setup() {
  Serial.begin(115200);

  xTaskCreate(
    TaskBlink,
    "TaskBlink",
    1024,
    NULL,
    2,
    NULL
  );

  xTaskCreate(
    TaskSerial,
    "TaskSerial",
    1024,
    NULL,
    1,
    NULL
  );
}

void loop() {
  // Empty. FreeRTOS handles scheduling.
}

void TaskBlink(void *pvParameters) {
  pinMode(LED_BUILTIN, OUTPUT);
  for (;;) {
    digitalWrite(LED_BUILTIN, HIGH);
    vTaskDelay(500 / portTICK_PERIOD_MS);
    digitalWrite(LED_BUILTIN, LOW);
    vTaskDelay(500 / portTICK_PERIOD_MS);
  }
}

void TaskSerial(void *pvParameters) {
  for (;;) {
    Serial.println("FreeRTOS Task Heartbeat");
    vTaskDelay(2000 / portTICK_PERIOD_MS);
  }
}`
  }
];

interface SnippetsMenuProps {
  onInsertSnippet: (code: string) => void;
}

export const SnippetsMenu: React.FC<SnippetsMenuProps> = ({ onInsertSnippet }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded transition-colors"
        title="Insert pre-built microcontroller snippet"
      >
        <Code2 className="w-3.5 h-3.5 text-teal-400" />
        <span>Snippets</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-72 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl z-50 py-1 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#30363d] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Insert Microcontroller Snippet
            </div>
            <div className="max-h-72 overflow-y-auto">
              {SNIPPETS.map(snip => (
                <button
                  key={snip.name}
                  type="button"
                  onClick={() => {
                    onInsertSnippet(snip.code);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#21262d] transition-colors border-b border-[#21262d]/50 last:border-b-0"
                >
                  <div className="text-xs font-medium text-slate-200">{snip.name}</div>
                  <div className="text-[11px] text-slate-400 leading-snug mt-0.5">{snip.description}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
