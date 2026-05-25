import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type SmsMessage = {
  body: string;
  to: string;
};

type SmsResult = {
  externalId?: string;
  provider: "mock" | "termii";
  raw?: Record<string, unknown> | null;
  status: "mocked" | "sent";
};

@Injectable()
export class SmsProvider {
  constructor(private readonly config: ConfigService) {}

  async send(message: SmsMessage): Promise<SmsResult> {
    const provider = this.config.get<"mock" | "termii">("SMS_PROVIDER", "mock");

    if (provider === "mock") {
      return {
        externalId: `mock-${Date.now()}`,
        provider,
        status: "mocked",
      };
    }

    return this.sendWithTermii(message);
  }

  private async sendWithTermii(message: SmsMessage): Promise<SmsResult> {
    const apiKey = this.config.get<string>("TERMII_API_KEY");
    const baseUrl = this.config.get<string>(
      "TERMII_BASE_URL",
      "https://api.ng.termii.com",
    );
    const senderId = this.config.get<string>("SMS_SENDER_ID", "12Cauldron");
    const channel = this.config.get<string>("SMS_CHANNEL", "generic");

    if (!apiKey) {
      throw new ServiceUnavailableException(
        "TERMII_API_KEY is required when SMS_PROVIDER is termii.",
      );
    }

    const response = await fetch(`${baseUrl}/api/sms/send`, {
      body: JSON.stringify({
        api_key: apiKey,
        channel,
        from: senderId,
        sms: message.body,
        to: message.to,
        type: "plain",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ServiceUnavailableException({
        message: "Termii SMS delivery failed.",
        providerStatus: response.status,
        providerResponse: payload,
      });
    }

    return {
      externalId: this.getExternalId(payload),
      provider: "termii",
      raw: this.asJsonRecord(payload),
      status: "sent",
    };
  }

  private getExternalId(payload: unknown) {
    if (!payload || typeof payload !== "object") return undefined;
    const record = payload as Record<string, unknown>;
    const messageId = record.message_id ?? record.messageId;
    return typeof messageId === "string" ? messageId : undefined;
  }

  private asJsonRecord(payload: unknown) {
    if (!payload || typeof payload !== "object") return null;
    return payload as Record<string, unknown>;
  }
}
