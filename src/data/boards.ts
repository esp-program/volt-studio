import { MicroBoard } from '../types/ide';

export const SUPPORTED_BOARDS: MicroBoard[] = [
  {
    id: 'esp32_devkit_v1',
    name: 'ESP32 DevKit V1 (DOIT 30-Pin)',
    architecture: 'Xtensa LX6 Dual-Core',
    mcu: 'ESP32-WROOM-32',
    flashBytes: 4194304, // 4MB Flash
    sramBytes: 524288,  // 520KB SRAM
    clockSpeed: '240 MHz',
    defaultBaud: 115200,
    digitalPins: 30,
    analogPins: 16,
    hasWifi: true,
    hasBluetooth: true,
    pinoutSummary: [
      'Pin D2 (Built-in Blue LED / GPIO2)',
      'Wi-Fi 802.11 b/g/n + BT 4.2 BLE dual-mode',
      'I2C: GPIO21 (SDA), GPIO22 (SCL)',
      'SPI: GPIO18 (SCK), GPIO19 (MISO), GPIO23 (MOSI), GPIO5 (SS)',
      'UART0: GPIO1 (TX0), GPIO3 (RX0) / UART2: GPIO17 (TX2), GPIO16 (RX2)',
      'ADC1: GPIO32-GPIO39 (12-bit ADC, safe with Wi-Fi)',
      'DAC: GPIO25 (DAC1), GPIO26 (DAC2) 8-bit true analog out',
      'Capacitive Touch: GPIO0, 2, 4, 12, 13, 14, 15, 27, 32, 33'
    ]
  },
  {
    id: 'esp32_devkitc_v4',
    name: 'ESP32 DevKitC V4 (Espressif 38-Pin)',
    architecture: 'Xtensa LX6 Dual-Core',
    mcu: 'ESP32-WROOM-32E/U',
    flashBytes: 4194304,
    sramBytes: 524288,
    clockSpeed: '240 MHz',
    defaultBaud: 115200,
    digitalPins: 38,
    analogPins: 18,
    hasWifi: true,
    hasBluetooth: true,
    pinoutSummary: [
      'Official Espressif 38-pin DevKit layout',
      'EN (Reset) & BOOT buttons with auto-flash circuit',
      'All 36 GPIOs exposed with 3.3V and 5V power rails',
      'Wi-Fi 802.11 b/g/n + Bluetooth 4.2 BLE',
      '18x 12-bit ADC channels, 2x 8-bit DAC channels',
      'Hardware PWM on any GPIO, 3x UART, 3x SPI, 2x I2C'
    ]
  },
  {
    id: 'esp32_s3',
    name: 'ESP32-S3 DevKitC-1',
    architecture: 'Xtensa LX7 Dual-Core with Vector AI',
    mcu: 'ESP32-S3-WROOM-1',
    flashBytes: 8388608, // 8MB Flash
    sramBytes: 512000,
    clockSpeed: '240 MHz',
    defaultBaud: 115200,
    digitalPins: 45,
    analogPins: 20,
    hasWifi: true,
    hasBluetooth: true,
    pinoutSummary: [
      'Dual Core LX7 240MHz with vector instructions for AI/ML',
      'Native USB OTG & USB-JTAG on GPIO19/20',
      'RGB Addressable WS2812 LED on GPIO48',
      'Wi-Fi 802.11 b/g/n + Bluetooth 5 (LE) Long Range',
      '45 programmable GPIOs, 14 capacitive touch inputs'
    ]
  },
  {
    id: 'esp32_cam',
    name: 'ESP32-CAM (AI-Thinker)',
    architecture: 'Xtensa LX6 Dual-Core',
    mcu: 'ESP32-S',
    flashBytes: 4194304,
    sramBytes: 4194304, // 520KB SRAM + 4MB PSRAM
    clockSpeed: '240 MHz',
    defaultBaud: 115200,
    digitalPins: 16,
    analogPins: 8,
    hasWifi: true,
    hasBluetooth: true,
    pinoutSummary: [
      'OV2640 / OV7670 camera connector onboard',
      'High-power flash LED on GPIO4',
      'MicroSD (TF card) slot on SPI bus',
      '4MB external PSRAM for frame buffering',
      'UART upload requires GPIO0 grounded to enter flash mode'
    ]
  },
  {
    id: 'arduino_uno',
    name: 'Arduino Uno R3',
    architecture: 'AVR',
    mcu: 'ATmega328P',
    flashBytes: 32256,
    sramBytes: 2048,
    clockSpeed: '16 MHz',
    defaultBaud: 9600,
    digitalPins: 14,
    analogPins: 6,
    hasWifi: false,
    hasBluetooth: false,
    pinoutSummary: ['D0-D1 (UART RX/TX)', 'D2-D3 (Ext Int)', 'D3, D5, D6, D9, D10, D11 (PWM)', 'A0-A5 (10-bit ADC)', 'A4 (SDA), A5 (SCL) I2C', 'D10 (SS), D11 (MOSI), D12 (MISO), D13 (SCK/LED)']
  },
  {
    id: 'arduino_nano',
    name: 'Arduino Nano',
    architecture: 'AVR',
    mcu: 'ATmega328P',
    flashBytes: 30720,
    sramBytes: 2048,
    clockSpeed: '16 MHz',
    defaultBaud: 115200,
    digitalPins: 14,
    analogPins: 8,
    hasWifi: false,
    hasBluetooth: false,
    pinoutSummary: ['Compact Breadboard form', 'D0-D13', 'A0-A7 (ADC)', 'Mini/Type-C USB CH340 / FTDI']
  },
  {
    id: 'arduino_mega',
    name: 'Arduino Mega 2560',
    architecture: 'AVR',
    mcu: 'ATmega2560',
    flashBytes: 258048,
    sramBytes: 8192,
    clockSpeed: '16 MHz',
    defaultBaud: 9600,
    digitalPins: 54,
    analogPins: 16,
    hasWifi: false,
    hasBluetooth: false,
    pinoutSummary: ['54 Digital I/O (15 PWM)', '4 Hardware Serial UARTs', '16 Analog Inputs', 'SPI, I2C, 256KB Flash']
  },
  {
    id: 'raspberry_pi_pico',
    name: 'Raspberry Pi Pico (RP2040)',
    architecture: 'ARM Cortex-M0+ Dual-Core',
    mcu: 'RP2040',
    flashBytes: 2097152,
    sramBytes: 264000,
    clockSpeed: '133 MHz',
    defaultBaud: 115200,
    digitalPins: 26,
    analogPins: 3,
    hasWifi: false,
    hasBluetooth: false,
    pinoutSummary: ['Programmable I/O (PIO) state machines', 'Dual ARM Cortex-M0+', '26 multi-function 3.3V GPIO pins', '12-bit ADC, 2x UART, 2x SPI, 2x I2C']
  },
  {
    id: 'stm32_bluepill',
    name: 'STM32F103C8 (Blue Pill)',
    architecture: 'ARM Cortex-M3',
    mcu: 'STM32F103C8T6',
    flashBytes: 65536,
    sramBytes: 20480,
    clockSpeed: '72 MHz',
    defaultBaud: 115200,
    digitalPins: 32,
    analogPins: 10,
    hasWifi: false,
    hasBluetooth: false,
    pinoutSummary: ['ARM Cortex-M3 72MHz', 'PA0-PA15, PB0-PB15, PC13 (LED)', 'CAN 2.0B, USB 2.0 FS, 2x SPI, 2x I2C, 3x USART']
  },
  {
    id: 'teensy_41',
    name: 'Teensy 4.1',
    architecture: 'ARM Cortex-M7 with FPU',
    mcu: 'NXP iMXRT1062',
    flashBytes: 8388608,
    sramBytes: 1048576,
    clockSpeed: '600 MHz',
    defaultBaud: 115200,
    digitalPins: 55,
    analogPins: 18,
    hasWifi: false,
    hasBluetooth: false,
    pinoutSummary: ['600 MHz ARM Cortex-M7 (fastest MCU)', '10/100 Mbit Ethernet PHY footprint', 'USB Host port & MicroSD socket', '35 PWM pins, 3x CAN bus, 8x Serial']
  }
];
