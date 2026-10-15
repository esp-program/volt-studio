/**
 * Web Serial API and Virtual Hardware COM Port manager
 */

export interface SerialPortInfo {
  id: string;
  name: string;
  isVirtual: boolean;
  connected: boolean;
  baudRate: number;
}

export type SerialDataListener = (data: string) => void;

class SerialManager {
  private physicalPort: any = null;
  private reader: any = null;
  private writer: any = null;
  private isReading = false;
  private listeners: Set<SerialDataListener> = new Set();
  
  // Virtual simulation properties
  public isVirtualActive = false;
  private virtualTimer: any = null;
  private simStep = 0;
  public virtualPin13 = false;

  public isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public subscribe(listener: SerialDataListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(data: string) {
    this.listeners.forEach(fn => fn(data));
  }

  /**
   * Request and open physical WebSerial device
   */
  public async connectPhysical(baudRate: number = 115200): Promise<{ success: boolean; portName: string; error?: string }> {
    if (!this.isWebSerialSupported()) {
      return {
        success: false,
        portName: '',
        error: 'Web Serial API is not supported in this browser. Please use Chrome/Edge or toggle Virtual COM Simulator.'
      };
    }

    try {
      // @ts-ignore
      this.physicalPort = await navigator.serial.requestPort();
      await this.physicalPort.open({ baudRate });

      const info = this.physicalPort.getInfo?.() || {};
      const portName = info.usbVendorId ? `USB COM (VID: 0x${info.usbVendorId.toString(16)})` : 'USB Serial Device';

      this.isVirtualActive = false;
      this.startReading();

      this.notify(`[VoltIDE] Connected to physical device on ${portName} @ ${baudRate} baud\n`);
      return { success: true, portName };
    } catch (err: any) {
      return { success: false, portName: '', error: err.message || 'Failed to open serial port' };
    }
  }

  private async startReading() {
    this.isReading = true;
    while (this.physicalPort && this.physicalPort.readable && this.isReading) {
      // @ts-ignore
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = this.physicalPort.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) {
            this.notify(value);
          }
        }
      } catch (error) {
        console.error('Serial read error:', error);
      } finally {
        this.reader?.releaseLock();
      }
    }
  }

  /**
   * Send data string to serial device
   */
  public async write(data: string, lineEnding: 'none' | 'nl' | 'cr' | 'nl_cr' = 'nl'): Promise<void> {
    let payload = data;
    if (lineEnding === 'nl') payload += '\n';
    else if (lineEnding === 'cr') payload += '\r';
    else if (lineEnding === 'nl_cr') payload += '\r\n';

    if (this.physicalPort && this.physicalPort.writable) {
      // @ts-ignore
      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(this.physicalPort.writable);
      const writer = textEncoder.writable.getWriter();
      await writer.write(payload);
      writer.releaseLock();
      return;
    }

    // If in virtual simulator mode
    if (this.isVirtualActive) {
      this.handleVirtualInput(payload.trim());
    }
  }

  /**
   * Disconnect physical port
   */
  public async disconnectPhysical(): Promise<void> {
    this.isReading = false;
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      if (this.physicalPort) {
        await this.physicalPort.close();
        this.physicalPort = null;
      }
      this.notify(`[VoltIDE] Serial port disconnected.\n`);
    } catch (err) {
      console.error('Error closing serial port:', err);
    }
  }

  /**
   * Start Virtual COM Simulator
   */
  public startVirtual(baudRate: number = 115200, sketchCode?: string) {
    this.isVirtualActive = true;
    if (this.virtualTimer) clearInterval(this.virtualTimer);

    this.notify(`[VoltIDE Simulator] Virtual COM3 initialized @ ${baudRate} baud\n`);
    this.notify(`[VoltIDE Simulator] Microcontroller boot sequence initialized.\n`);
    this.notify(`[VoltIDE Simulator] Type 'HELP', 'LED_ON', 'LED_OFF', or 'RESET' to interact.\n`);

    this.simStep = 0;
    this.virtualTimer = setInterval(() => {
      this.simStep++;
      const timeMs = this.simStep * 500;

      // Realistic sine & cosine wave / sensor data generator for Serial Monitor & Serial Plotter
      const sineVal = Math.round(500 + Math.sin(this.simStep * 0.15) * 350);
      const cosVal = Math.round(500 + Math.cos(this.simStep * 0.15) * 200);
      const noise = Math.round(Math.random() * 20 - 10);
      const tempC = (23.4 + Math.sin(this.simStep * 0.05) * 2.1).toFixed(1);

      // Periodically toggle virtual LED on pin 13
      if (this.simStep % 4 === 0) {
        this.virtualPin13 = !this.virtualPin13;
      }

      // Format formatted stream for Serial Plotter & Monitor
      if (this.simStep % 2 === 0) {
        this.notify(`SensorA:${sineVal + noise},SensorB:${cosVal},Temp:${tempC}\n`);
      }
    }, 600);
  }

  public stopVirtual() {
    this.isVirtualActive = false;
    if (this.virtualTimer) {
      clearInterval(this.virtualTimer);
      this.virtualTimer = null;
    }
    this.notify(`[VoltIDE Simulator] Virtual COM3 stopped.\n`);
  }

  private handleVirtualInput(cmd: string) {
    const upper = cmd.toUpperCase();
    if (upper === 'HELP') {
      this.notify(`\n--- Virtual MCU Command Menu ---\n`);
      this.notify(`LED_ON   : Force onboard LED HIGH (Pin 13)\n`);
      this.notify(`LED_OFF  : Force onboard LED LOW (Pin 13)\n`);
      this.notify(`PING     : Reply PONG with MCU uptime\n`);
      this.notify(`STATUS   : Show virtual MCU registers\n`);
      this.notify(`RESET    : Perform software reset\n`);
      this.notify(`--------------------------------\n`);
    } else if (upper === 'LED_ON') {
      this.virtualPin13 = true;
      this.notify(`OK: Pin 13 set to HIGH [LED ON]\n`);
    } else if (upper === 'LED_OFF') {
      this.virtualPin13 = false;
      this.notify(`OK: Pin 13 set to LOW [LED OFF]\n`);
    } else if (upper === 'PING') {
      this.notify(`PONG! (Uptime: ${this.simStep * 0.5}s, Heap: 284120 bytes)\n`);
    } else if (upper === 'STATUS') {
      this.notify(`VMCU: 3.3V Rail OK | Pin13: ${this.virtualPin13 ? 'HIGH' : 'LOW'} | Baud: 115200\n`);
    } else if (upper === 'RESET') {
      this.notify(`[VoltIDE Simulator] Software reset triggered! Rebooting...\n`);
      this.simStep = 0;
    } else {
      this.notify(`Echo [Virtual RX]: "${cmd}"\n`);
    }
  }
}

export const serialManager = new SerialManager();
