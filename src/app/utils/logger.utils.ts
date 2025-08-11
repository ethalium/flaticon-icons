import {Chalk, ChalkInstance} from 'chalk';
import {ColorName} from "chalk";

interface LoggerMessage {
  level?: string;
  colorLevel?: ColorName;
  colorMessage?: ColorName;
  message: string|string[];
  indent?: number;
}

interface LoggerMessageOptions extends Omit<LoggerMessage, 'level'|'message'> {}

export class Logger {
  private static colors: ChalkInstance = new Chalk();

  /**
   * Logs an informational message with the specified indentation.
   *
   * @param {string|string[]} message - The message or array of messages to log.
   * @param options
   * @return {void}
   */
  static info(message: string|string[], options?: LoggerMessageOptions) {
    this.log({
      level: 'info',
      colorLevel: 'blue',
      message: message,
      ...(options || {})
    });
  }

  /**
   * Logs a success message with specified indentation.
   *
   * @param {string|string[]} message - The message or an array of messages to be logged.
   * @param options
   * @return {void} - Does not return a value.
   */
  static success(message: string|string[], options?: LoggerMessageOptions) {
    this.log({
      level: 'info',
      colorLevel: 'green',
      colorMessage: 'green',
      message: message,
      ...(options || {})
    });
  }

  /**
   * Logs a warning message with specified indentation.
   *
   * @param {string|string[]} message - The warning message or an array of messages to log.
   * @param options
   * @return {void} This method does not return a value.
   */
  static warn(message: string|string[], options?: LoggerMessageOptions) {
    this.log({
      level: 'warn',
      colorLevel: 'yellow',
      colorMessage: 'yellow',
      message: message,
      ...(options || {})
    });
  }

  /**
   * Logs an error message with specified indentation.
   *
   * @param {string|string[]} message - The error message to log. Can be a string or an array of strings.
   * @param options
   * @return {void} Does not return a value.
   */
  static error(message: string|string[], options?: LoggerMessageOptions) {
    this.log({
      level: 'error',
      colorLevel: 'red',
      colorMessage: 'red',
      message: message,
      ...(options || {})
    });
  }

  /**
   * Logs a debug message with specified indentation.
   *
   * @param {string|string[]} message - The error message to log. Can be a string or an array of strings.
   * @param options
   * @return {void} Does not return a value.
   */
  static debug(message: string|string[], options?: LoggerMessageOptions) {
    this.log({
      level: 'debug',
      colorLevel: 'cyan',
      colorMessage: 'cyan',
      message: message,
      ...(options || {})
    });
  }

  /**
   * Logs a formatted message to the console, applying optional colors, indentation, and message levels.
   *
   * @param {LoggerMessage} message - The message object containing details for the log entry. Includes properties such as:
   *                                  - `level` (optional): The log level (e.g., INFO, ERROR).
   *                                  - `colorLevel` (optional): Specifies the color to apply to the log level.
   *                                  - `indent` (optional): Number of spaces to indent the log message.
   *                                  - `message`: An array of message strings to log.
   *                                  - `colorMessage` (optional): Specifies the color to apply to the message content.
   *
   * @return {void} This method does not return a value.
   */
  private static log(message: LoggerMessage): void {

    // create array for messages
    const messages: string[] = ['[::]'];

    // add level to messages
    if(message.level){
      messages.push(message.colorLevel ? this.colors[message.colorLevel](message.level) : message.level);
      messages.push(':');
    }

    // add indent to messages
    if(message.indent && message.indent > 0){
      messages.push(' '.repeat(message.indent));
    }

    // add message to messages
    messages.push(...(Array.isArray(message.message) ? message.message : [message.message]).filter(_ => !!_).map(_ => {
      return message.colorMessage ? this.colors[message.colorMessage](_) : _;
    }));

    // convert message to string
    const msg = messages.join(' ');

    // log messages into console
    // process.stdout.write(msg + '\n');
    console.log(msg);

  }

}