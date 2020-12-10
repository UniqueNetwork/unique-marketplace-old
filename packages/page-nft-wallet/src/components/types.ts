export interface MessageInterface {
  negative?: boolean;
  success?: boolean;
  warning?: boolean;
  info?: boolean;
  messageText: string;
  messageDescription?: string;
}
