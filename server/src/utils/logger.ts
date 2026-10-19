import fs from 'fs';
import path from 'path';

// Server Logger with dynamic on/off toggle via ENABLE_LOGS / SERVER_LOGS environment variable
// When ENABLE_LOGS=false or SERVER_LOGS=false, NO logs will appear in the console or terminal.

const logsDir = path.join(__dirname, '../../logs');
const logFilePath = path.join(logsDir, 'server.log');

// Helper to determine if logs are enabled
export const isLogsEnabled = (): boolean => {
  const envVal = process.env.ENABLE_LOGS || process.env.SERVER_LOGS;
  if (envVal === 'false' || envVal === '0') {
    return false;
  }
  return true;
};

// Ensure logs directory exists if logging to file is active
const ensureLogDirectory = () => {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  } catch (err) {
    // Ignore folder creation errors
  }
};

// Append formatted line to logs/server.log
const appendToFile = (level: string, message: string) => {
  if (!isLogsEnabled()) return;
  try {
    ensureLogDirectory();
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] ${message}\n`;
    fs.appendFileSync(logFilePath, line, 'utf8');
  } catch (err) {
    // Ignore file write errors
  }
};

// Format terminal message
const formatMessage = (level: string, message: string): string => {
  const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
  return `[${time}] [${level}] ${message}`;
};

// Store original console methods
const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: console.debug.bind(console),
};

// Structured Logger Object
export const logger = {
  info: (msg: string, ...args: any[]) => {
    if (!isLogsEnabled()) return;
    const formatted = formatMessage('INFO', msg);
    originalConsole.log(formatted, ...args);
    appendToFile('INFO', [msg, ...args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a))].join(' '));
  },
  warn: (msg: string, ...args: any[]) => {
    if (!isLogsEnabled()) return;
    const formatted = formatMessage('WARN', msg);
    originalConsole.warn(formatted, ...args);
    appendToFile('WARN', [msg, ...args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a))].join(' '));
  },
  error: (msg: string, ...args: any[]) => {
    if (!isLogsEnabled()) return;
    const formatted = formatMessage('ERROR', msg);
    originalConsole.error(formatted, ...args);
    appendToFile('ERROR', [msg, ...args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a))].join(' '));
  },
  socket: (msg: string, ...args: any[]) => {
    if (!isLogsEnabled()) return;
    const formatted = formatMessage('SOCKET', msg);
    originalConsole.log(formatted, ...args);
    appendToFile('SOCKET', [msg, ...args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a))].join(' '));
  },
  http: (msg: string, ...args: any[]) => {
    if (!isLogsEnabled()) return;
    const formatted = formatMessage('HTTP', msg);
    originalConsole.log(formatted, ...args);
    appendToFile('HTTP', [msg, ...args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a))].join(' '));
  },
  isEnabled: isLogsEnabled,
};

// Initializes the logger on server startup.
// If ENABLE_LOGS=false, globally mutes console.log, console.info, console.warn, console.error.
export const initServerLogger = () => {
  if (!isLogsEnabled()) {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.warn = noop;
    console.error = noop;
    console.debug = noop;
  } else {
    ensureLogDirectory();
  }
};
