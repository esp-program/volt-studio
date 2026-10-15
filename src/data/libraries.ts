import { ArduinoLibrary } from '../types/ide';

export const INITIAL_LIBRARIES: ArduinoLibrary[] = [
  {
    id: 'adafruit_neopixel',
    name: 'Adafruit NeoPixel',
    version: '1.12.0',
    author: 'Adafruit Industries',
    category: 'LED/Lighting',
    description: 'Arduino library for controlling single-wire-based LED pixels and strip (WS2812B, WS2811, SK6812).',
    repositoryUrl: 'https://github.com/adafruit/Adafruit_NeoPixel',
    headers: ['Adafruit_NeoPixel.h'],
    sampleCode: `#include <Adafruit_NeoPixel.h>

#define PIN_NEOPIXEL 6
#define NUMPIXELS 16

Adafruit_NeoPixel strip(NUMPIXELS, PIN_NEOPIXEL, NEO_GRB + NEO_KHZ800);

void setup() {
  strip.begin();
  strip.setBrightness(50);
  strip.show();
}

void loop() {
  for(int i=0; i<NUMPIXELS; i++) {
    strip.setPixelColor(i, strip.Color(0, 150, 255));
    strip.show();
    delay(50);
  }
  delay(500);
  strip.clear();
}`,
    installed: true,
    likes: 1240,
    downloads: 9800
  },
  {
    id: 'arduinojson',
    name: 'ArduinoJson',
    version: '7.0.4',
    author: 'Benoît Blanchon',
    category: 'Utilities',
    description: 'An elegant and efficient C++ JSON library for Arduino and IoT microcontrollers with zero-allocation parsing.',
    repositoryUrl: 'https://github.com/bblanchon/ArduinoJson',
    headers: ['ArduinoJson.h'],
    sampleCode: `#include <ArduinoJson.h>

void setup() {
  Serial.begin(115200);
  while (!Serial);

  JsonDocument doc;
  doc["sensor"] = "DHT22";
  doc["time"] = 1351824120;
  doc["data"][0] = 48.756080;
  doc["data"][1] = 2.302038;

  serializeJsonPretty(doc, Serial);
}

void loop() {}`,
    installed: true,
    likes: 2150,
    downloads: 14200
  },
  {
    id: 'pubsubclient',
    name: 'PubSubClient',
    version: '2.8.0',
    author: 'Nick O\'Leary',
    category: 'IoT/Networking',
    description: 'A client library for simple publish/subscribe messaging with an MQTT broker (supports ESP8266, ESP32, Arduino).',
    repositoryUrl: 'https://github.com/knolleary/pubsubclient',
    headers: ['PubSubClient.h'],
    sampleCode: `#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "MyNetwork";
const char* password = "Password123";
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  for (int i=0;i<length;i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    // reconnect logic
  }
  client.loop();
}`,
    installed: false,
    likes: 890,
    downloads: 7200
  },
  {
    id: 'fastled',
    name: 'FastLED',
    version: '3.6.0',
    author: 'Daniel Garcia, Mark Kriegsman',
    category: 'LED/Lighting',
    description: 'Blazing fast, feature-rich C++ LED animation library for Arduino, ESP32, ARM chips with rich color palettes and math.',
    repositoryUrl: 'https://github.com/FastLED/FastLED',
    headers: ['FastLED.h'],
    sampleCode: `#include <FastLED.h>

#define NUM_LEDS 60
#define DATA_PIN 5

CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(84);
}

void loop() {
  fill_rainbow(leds, NUM_LEDS, millis() / 20, 7);
  FastLED.show();
  delay(10);
}`,
    installed: false,
    likes: 1450,
    downloads: 11000
  },
  {
    id: 'liquidcrystal_i2c',
    name: 'LiquidCrystal_I2C',
    version: '1.1.2',
    author: 'Frank de Brabander',
    category: 'Displays',
    description: 'Library for 16x2 and 20x4 LCD displays driven by PCF8574 I2C expander (uses only SDA & SCL pins).',
    repositoryUrl: 'https://github.com/marcoschwartz/LiquidCrystal_I2C',
    headers: ['Wire.h', 'LiquidCrystal_I2C.h'],
    sampleCode: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("VoltIDE Studio");
  lcd.setCursor(0, 1);
  lcd.print("System Ready!");
}

void loop() {}`,
    installed: true,
    likes: 980,
    downloads: 8500
  },
  {
    id: 'dht_sensor_library',
    name: 'DHT sensor library',
    version: '1.4.6',
    author: 'Adafruit Industries',
    category: 'Sensors',
    description: 'Arduino library for reading DHT11, DHT22, and AM2302 digital temperature and relative humidity sensors.',
    repositoryUrl: 'https://github.com/adafruit/DHT-sensor-library',
    headers: ['DHT.h'],
    sampleCode: `#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print(" %  Temperature: ");
  Serial.print(t);
  Serial.println(" *C");
}`,
    installed: true,
    likes: 1670,
    downloads: 13900
  },
  {
    id: 'servo',
    name: 'Servo',
    version: '1.2.1',
    author: 'Arduino',
    category: 'Motors',
    description: 'Allows an Arduino board to control RC (hobby) servo motors on any digital pin using hardware timers.',
    repositoryUrl: 'https://github.com/arduino-libraries/Servo',
    headers: ['Servo.h'],
    sampleCode: `#include <Servo.h>

Servo myServo;
int pos = 0;

void setup() {
  myServo.attach(9);
}

void loop() {
  for (pos = 0; pos <= 180; pos += 1) {
    myServo.write(pos);
    delay(15);
  }
  for (pos = 180; pos >= 0; pos -= 1) {
    myServo.write(pos);
    delay(15);
  }
}`,
    installed: true,
    likes: 850,
    downloads: 9100
  },

  // COMMUNITY SUBMITTED LIBRARIES
  {
    id: 'comm_prism_ui',
    name: 'PrismOLED_UI',
    version: '2.1.0',
    author: 'CyberMaker_99',
    authorAvatar: 'CM',
    category: 'Displays',
    description: 'Community UI toolkit for monochrome SSD1306 OLED displays with smooth scrolling menus, bar graphs, and animations.',
    repositoryUrl: 'https://github.com/community/PrismOLED_UI',
    headers: ['PrismOLED_UI.h'],
    isCommunity: true,
    likes: 312,
    downloads: 1420,
    headerCode: `// PrismOLED_UI.h - Community Lightweight Menu Library
#ifndef PRISMOLED_UI_H
#define PRISMOLED_UI_H

#include <Arduino.h>
#include <Wire.h>

class PrismOLED_UI {
public:
  PrismOLED_UI(uint8_t i2cAddress = 0x3C) : _addr(i2cAddress) {}
  void begin() { Wire.begin(); }
  void drawProgressBar(int x, int y, int w, int h, int percent) {
    // Renders smooth rounded progress bar on screen
  }
  void drawCard(const char* title, const char* value) {
    // Draws glassmorphic UI card
  }
private:
  uint8_t _addr;
};

#endif`,
    sampleCode: `#include <Wire.h>
#include <PrismOLED_UI.h>

PrismOLED_UI ui(0x3C);

void setup() {
  Serial.begin(115200);
  ui.begin();
  Serial.println("PrismOLED_UI Initialized!");
}

void loop() {
  for(int p=0; p<=100; p+=5) {
    ui.drawProgressBar(10, 20, 100, 12, p);
    delay(50);
  }
}`,
    installed: false
  },
  {
    id: 'comm_ble_gamepad',
    name: 'ESP32_BleGamepadPro',
    version: '1.4.2',
    author: 'AlejandroV_Dev',
    authorAvatar: 'AV',
    category: 'IoT/Networking',
    description: 'Ultra-low latency Bluetooth LE gamepad library for ESP32 with 16 buttons, 2 analog joysticks, and battery level reporting.',
    repositoryUrl: 'https://github.com/community/ESP32_BleGamepadPro',
    headers: ['ESP32_BleGamepadPro.h'],
    isCommunity: true,
    likes: 478,
    downloads: 2850,
    headerCode: `// ESP32_BleGamepadPro.h - Community BLE Controller Driver
#ifndef ESP32_BLE_GAMEPAD_PRO_H
#define ESP32_BLE_GAMEPAD_PRO_H

#include <Arduino.h>

class BleGamepadPro {
public:
  BleGamepadPro(const char* name = "VoltIDE Gamepad") {}
  void begin() { Serial.println("BLE Gamepad advertising started."); }
  bool isConnected() { return true; }
  void press(uint16_t b) {}
  void release(uint16_t b) {}
  void setAxes(int16_t x, int16_t y, int16_t z, int16_t rz) {}
};

#endif`,
    sampleCode: `#include <ESP32_BleGamepadPro.h>

BleGamepadPro gamepad("VoltIDE CyberPad");

void setup() {
  Serial.begin(115200);
  gamepad.begin();
  pinMode(4, INPUT_PULLUP);
}

void loop() {
  if (gamepad.isConnected()) {
    if (digitalRead(4) == LOW) {
      gamepad.press(1); // Button A
    } else {
      gamepad.release(1);
    }
  }
  delay(10);
}`,
    installed: false
  },
  {
    id: 'comm_sensor_filter',
    name: 'MovingAverageExp',
    version: '1.0.8',
    author: 'Elena_Signals',
    authorAvatar: 'ES',
    category: 'Sensors',
    description: 'Fast exponential moving average & Kalman-lite filter for smoothing noisy analog sensors without memory overhead.',
    repositoryUrl: 'https://github.com/community/MovingAverageExp',
    headers: ['MovingAverageExp.h'],
    isCommunity: true,
    likes: 245,
    downloads: 1890,
    headerCode: `// MovingAverageExp.h
#ifndef MOVING_AVERAGE_EXP_H
#define MOVING_AVERAGE_EXP_H

class MovingAverageExp {
private:
  float _alpha;
  float _filtered;
public:
  MovingAverageExp(float alpha = 0.15f) : _alpha(alpha), _filtered(0.0f) {}
  float add(float raw) {
    _filtered = (_alpha * raw) + ((1.0f - _alpha) * _filtered);
    return _filtered;
  }
  float get() const { return _filtered; }
  void reset() { _filtered = 0.0f; }
};

#endif`,
    sampleCode: `#include <MovingAverageExp.h>

MovingAverageExp filter(0.12f); // smoothing factor

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(A0);
  float smooth = filter.add(raw);

  // Serial Plotter format
  Serial.print("Raw:");
  Serial.print(raw);
  Serial.print(",Filtered:");
  Serial.println(smooth);
  delay(30);
}`,
    installed: false
  }
];
