export interface MicroBoard {
  id: string;
  name: string;
  architecture: string;
  mcu: string;
  flashBytes: number;
  sramBytes: number;
  clockSpeed: string;
  defaultBaud: number;
  digitalPins: number;
  analogPins: number;
  hasWifi: boolean;
  hasBluetooth: boolean;
  pinoutSummary: string[];
}

export interface LibraryHeader {
  filename: string;
  content: string;
}

export interface ArduinoLibrary {
  id: string;
  name: string;
  version: string;
  author: string;
  category: 'Sensors' | 'Displays' | 'IoT/Networking' | 'LED/Lighting' | 'Motors' | 'Utilities' | 'Audio';
  description: string;
  repositoryUrl: string;
  headers: string[];
  sampleCode?: string;
  headerCode?: string;
  cppCode?: string;
  installed: boolean;
  isCustom?: boolean;
  isCommunity?: boolean;
  likes?: number;
  downloads?: number;
  authorAvatar?: string;
}

export interface SketchFile {
  name: string;
  content: string;
  isEntry?: boolean;
}

export interface CompilationResult {
  success: boolean;
  flashUsed: number;
  flashTotal: number;
  sramUsed: number;
  sramTotal: number;
  logs: string[];
  error?: {
    line: number;
    file: string;
    message: string;
  };
}

export interface CommunitySketch {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  description: string;
  boardId: string;
  category: string;
  tags: string[];
  files: SketchFile[];
  requiredLibraries: string[];
  likes: number;
  views: number;
  date: string;
  isUserCreated?: boolean;
}

export interface SerialLogEntry {
  id: string;
  timestamp: string;
  direction: 'in' | 'out' | 'system';
  text: string;
}

export interface PlotterDataset {
  name: string;
  color: string;
  values: number[];
}
