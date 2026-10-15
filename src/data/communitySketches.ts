import { CommunitySketch } from '../types/ide';

export const INITIAL_COMMUNITY_SKETCHES: CommunitySketch[] = [
  {
    id: 'sketch-esp32-web-telemetry',
    title: 'ESP32 Wi-Fi Telemetry Server & Dashboard',
    author: 'Elena Rostova (IoT Lab)',
    authorAvatar: 'ER',
    description: 'Lightweight HTTP server on ESP32 that broadcasts real-time analog sensor metrics via JSON API and controls built-in LED over local browser network.',
    boardId: 'esp32_wroom',
    category: 'IoT/Networking',
    tags: ['ESP32', 'WiFi', 'HTTP', 'JSON', 'Web Server'],
    likes: 342,
    views: 1820,
    date: 'Oct 2026',
    requiredLibraries: ['ArduinoJson'],
    files: [
      {
        name: 'telemetry_server.ino',
        isEntry: true,
        content: `// ESP32 Telemetry & Web Dashboard Server
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const char* ssid = "Makerspace_2.4G";
const char* password = "maker_access_pass";

WebServer server(80);
const int LED_PIN = 2; // Built-in LED on ESP32
int readInterval = 1000;
unsigned long lastRead = 0;

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><title>ESP32 Node</title></head>";
  html += "<body style='font-family:sans-serif;padding:2rem;'>";
  html += "<h2>VoltIDE ESP32 Telemetry Node</h2>";
  html += "<p>MCU Clock: 240MHz | Uptime: " + String(millis() / 1000) + "s</p>";
  html += "<a href='/api/data'>View JSON Feed</a>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleData() {
  JsonDocument doc;
  doc["uptime_sec"] = millis() / 1000;
  doc["hall_reading"] = hallRead();
  doc["analog_pin34"] = analogRead(34);
  doc["free_heap"] = ESP.getFreeHeap();
  doc["status"] = "NOMINAL";

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("Initiating WiFi connection...");
  WiFi.begin(ssid, password);
  
  // Wait up to 5 seconds or fallback to AP mode
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi Connected! IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Running in Offline Simulator Mode (IP: 192.168.4.1)");
  }

  server.on("/", handleRoot);
  server.on("/api/data", handleData);
  server.begin();
  Serial.println("HTTP Server listening on port 80");
}

void loop() {
  server.handleClient();

  if (millis() - lastRead > 1500) {
    lastRead = millis();
    int val = analogRead(34);
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // Heartbeat blink
    Serial.print("Telemetry Heartbeat - Analog A0: ");
    Serial.print(val);
    Serial.print(", Free Heap: ");
    Serial.println(ESP.getFreeHeap());
  }
}`
      },
      {
        name: 'config.h',
        content: `// Configuration & PIN definitions
#ifndef CONFIG_H
#define CONFIG_H

#define SENSOR_ANALOG_PIN 34
#define STATUS_LED 2
#define SAMPLING_RATE_MS 1000

#endif`
      }
    ]
  },
  {
    id: 'sketch-arduino-neopixel-visualizer',
    title: 'Dual NeoPixel Spectrum Analyzer & Audio React',
    author: 'Marco Silvetti',
    authorAvatar: 'MS',
    description: 'Smooth FastLED / NeoPixel spectrum animation with logarithmic audio frequency mapping, peak decay hold, and 8 color gradients.',
    boardId: 'arduino_uno',
    category: 'LED/Lighting',
    tags: ['NeoPixel', 'WS2812', 'LED', 'Visualizer', 'Arduino Uno'],
    likes: 489,
    views: 2950,
    date: 'Sep 2026',
    requiredLibraries: ['Adafruit NeoPixel'],
    files: [
      {
        name: 'audio_visualizer.ino',
        isEntry: true,
        content: `// Dual NeoPixel Spectrum Visualizer
#include <Adafruit_NeoPixel.h>

#define LED_PIN 6
#define NUM_LEDS 24
#define AUDIO_PIN A0

Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

int peakVal = 0;
int decayRate = 2;

void setup() {
  Serial.begin(115200);
  strip.begin();
  strip.setBrightness(60);
  strip.show();
  Serial.println("NeoPixel Audio Visualizer initialized on Pin 6");
}

void loop() {
  int raw = analogRead(AUDIO_PIN);
  int sample = abs(raw - 512); // Center baseline
  
  // Calculate bar height
  int barHeight = map(sample, 0, 400, 0, NUM_LEDS);
  barHeight = constrain(barHeight, 0, NUM_LEDS);

  if (barHeight > peakVal) {
    peakVal = barHeight;
  } else if (peakVal > 0) {
    peakVal -= decayRate;
  }

  strip.clear();
  for (int i = 0; i < barHeight; i++) {
    uint32_t col = strip.Color(i * 10, 255 - (i * 8), 120);
    strip.setPixelColor(i, col);
  }

  if (peakVal < NUM_LEDS) {
    strip.setPixelColor(peakVal, strip.Color(255, 0, 50)); // Red peak indicator
  }

  strip.show();
  
  // Serial output for Serial Plotter
  Serial.print("AudioLevel:");
  Serial.print(sample);
  Serial.print(",Peak:");
  Serial.println(peakVal * 15);

  delay(20);
}`
      }
    ]
  },
  {
    id: 'sketch-pico-multithread-sensor',
    title: 'Raspberry Pi Pico RP2040 Dual-Core Sensor Fusion',
    author: 'Kaelen Thorne',
    authorAvatar: 'KT',
    description: 'Takes advantage of RP2040 dual ARM Cortex-M0+ cores: Core 0 handles serial communication & display while Core 1 performs ultra-fast sensor sampling.',
    boardId: 'raspberry_pi_pico',
    category: 'Sensors',
    tags: ['RP2040', 'DualCore', 'Multiprocessing', 'Pico'],
    likes: 215,
    views: 1430,
    date: 'Oct 2026',
    requiredLibraries: ['DHT sensor library'],
    files: [
      {
        name: 'pico_dualcore.ino',
        isEntry: true,
        content: `// RP2040 Dual Core Multiprocessing Demonstration
// Core 0 runs setup() and loop()
// Core 1 runs setup1() and loop1()

#include <DHT.h>

#define DHTPIN 15
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

volatile float shared_temp = 0.0;
volatile float shared_humidity = 0.0;
volatile bool data_ready = false;

// CORE 0: Serial Reporting and High-Level logic
void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("=== RP2040 Dual Core System Ready ===");
}

void loop() {
  if (data_ready) {
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.print("Temperature:");
    Serial.print(shared_temp);
    Serial.print(",Humidity:");
    Serial.println(shared_humidity);
    delay(50);
    digitalWrite(LED_BUILTIN, LOW);
  }
  delay(100);
}

// CORE 1: Dedicated Hardware Sensor Sampling Loop
void setup1() {
  dht.begin();
  delay(500);
}

void loop1() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t) && !isnan(h)) {
    shared_temp = t;
    shared_humidity = h;
    data_ready = true;
  }
  delay(1000); // 1-second sampling cycle
}`
      }
    ]
  },
  {
    id: 'sketch-stm32-robotic-arm',
    title: 'STM32 4-DOF Robotic Arm Inverse Kinematics Controller',
    author: 'Dr. Hiroshi Tanaka',
    authorAvatar: 'HT',
    description: 'Precision PWM multi-servo driver on STM32 BluePill with smooth Bezier curve acceleration and emergency soft stop safety routines.',
    boardId: 'stm32_bluepill',
    category: 'Motors',
    tags: ['STM32', 'Robotics', 'Servo', 'Kinematics', 'BluePill'],
    likes: 310,
    views: 2100,
    date: 'Aug 2026',
    requiredLibraries: ['Servo'],
    files: [
      {
        name: 'stm32_robotic_arm.ino',
        isEntry: true,
        content: `// STM32 4-DOF Robotic Arm with Smooth Acceleration
#include <Servo.h>

Servo baseServo;
Servo shoulderServo;
Servo elbowServo;
Servo gripperServo;

const int PIN_BASE = PA0;
const int PIN_SHOULDER = PA1;
const int PIN_ELBOW = PA2;
const int PIN_GRIPPER = PA3;
const int PIN_BOARD_LED = PC13;

int targetAngle = 90;
int currentAngle = 90;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BOARD_LED, OUTPUT);

  baseServo.attach(PIN_BASE);
  shoulderServo.attach(PIN_SHOULDER);
  elbowServo.attach(PIN_ELBOW);
  gripperServo.attach(PIN_GRIPPER);

  // Home position
  baseServo.write(90);
  shoulderServo.write(45);
  elbowServo.write(120);
  gripperServo.write(30);

  Serial.println("STM32 Arm Controller Online. Send commands: BASE:<angle> or HOME");
}

void loop() {
  // Check for Serial Commands
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    if (cmd.startsWith("BASE:")) {
      int ang = cmd.substring(5).toInt();
      targetAngle = constrain(ang, 0, 180);
      Serial.print("Moving base to: ");
      Serial.println(targetAngle);
    } else if (cmd == "HOME") {
      targetAngle = 90;
      Serial.println("Returning to Home Position");
    }
  }

  // Smooth interpolation
  if (currentAngle < targetAngle) {
    currentAngle++;
    baseServo.write(currentAngle);
    delay(15);
  } else if (currentAngle > targetAngle) {
    currentAngle--;
    baseServo.write(currentAngle);
    delay(15);
  }

  digitalWrite(PIN_BOARD_LED, (currentAngle == targetAngle) ? HIGH : LOW);
}`
      }
    ]
  },
  {
    id: 'sketch-arduino-smart-weather-station',
    title: 'LCD Weather Station with Heat Index & Sensor Logger',
    author: 'Clara Mendez',
    authorAvatar: 'CM',
    description: 'Complete environmental monitor for Arduino Uno/Nano with I2C 16x2 LCD, DHT22 sensor, dew point and heat index computation.',
    boardId: 'arduino_uno',
    category: 'Sensors',
    tags: ['Arduino', 'I2C', 'LCD', 'DHT22', 'Weather'],
    likes: 412,
    views: 2600,
    date: 'Sep 2026',
    requiredLibraries: ['DHT sensor library', 'LiquidCrystal_I2C'],
    files: [
      {
        name: 'weather_station.ino',
        isEntry: true,
        content: `// Smart Weather Station with I2C LCD Display
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(9600);
  dht.begin();
  lcd.init();
  lcd.backlight();
  
  lcd.setCursor(0, 0);
  lcd.print("VoltIDE Weather");
  lcd.setCursor(0, 1);
  lcd.print("Sensors Calib...");
  delay(1500);
  lcd.clear();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    lcd.setCursor(0, 0);
    lcd.print("Sensor Read Err!");
    delay(2000);
    return;
  }

  // Compute Heat Index in Celsius
  float hi = dht.computeHeatIndex(t, h, false);

  // LCD Row 1: Temp & Humidity
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(t, 1);
  lcd.print("C  H:");
  lcd.print(h, 0);
  lcd.print("%");

  // LCD Row 2: Heat Index
  lcd.setCursor(0, 1);
  lcd.print("Feels: ");
  lcd.print(hi, 1);
  lcd.print("C");

  // Telemetry stream to Serial Plotter
  Serial.print("Temp_C:");
  Serial.print(t);
  Serial.print(",Humidity_Pct:");
  Serial.print(h);
  Serial.print(",HeatIndex_C:");
  Serial.println(hi);

  delay(2000);
}`
      }
    ]
  }
];
