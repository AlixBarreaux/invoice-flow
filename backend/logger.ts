import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Daily rotate transport
const rotateTransport = new transports.DailyRotateFile({
  dirname: "logs",          // folder for log files
  filename: "%DATE%-combined.log", // filename pattern
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxFiles: "7d",           // keep logs for 7 days
  level: "info",
});

const errorRotateTransport = new transports.DailyRotateFile({
  dirname: "logs",
  filename: "%DATE%-error.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxFiles: "7d",
  level: "error",
});

export const logger = createLogger({
  level: "info",
  format: combine(
    colorize(),
    timestamp(),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    rotateTransport,
    errorRotateTransport,
  ],
});

export default logger;
