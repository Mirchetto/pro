class TelegramNotifier {
  private botToken: string | undefined;
  private chatId: string | undefined;
  private isConfigured: boolean = false;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.isConfigured = !!(this.botToken && this.chatId);

    if (!this.isConfigured) {
      console.log("⚠️ Telegram notifications disabled (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID)");
    } else {
      console.log("✅ Telegram notifications enabled");
    }
  }

  async sendBoomAlert(params: {
    symbol: string;
    companyName: string | null;
    currentPrice: number;
    priceChange: number;
    volumeRatio: number;
    triggerPrice: number;
  }): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const message = this.formatBoomMessage(params);
      return await this.sendMessage(message);
    } catch (error) {
      console.error("❌ Error sending Telegram boom alert:", error);
      return false;
    }
  }

  private formatBoomMessage(params: {
    symbol: string;
    companyName: string | null;
    currentPrice: number;
    priceChange: number;
    volumeRatio: number;
    triggerPrice: number;
  }): string {
    const { symbol, companyName, currentPrice, priceChange, volumeRatio, triggerPrice } = params;

    const emoji = priceChange >= 5 ? "🚀" : "📈";
    const priceEmoji = priceChange >= 5 ? "🔥" : "💰";

    return `${emoji} *BOOM ALERT* ${emoji}

${priceEmoji} *${symbol}* ${companyName ? `(${companyName})` : ""}

📊 *Price:* $${currentPrice.toFixed(2)}
📈 *Change:* +${priceChange.toFixed(2)}%
📦 *Volume:* ${volumeRatio.toFixed(1)}x avg
🎯 *Entry:* $${triggerPrice.toFixed(2)}

⏰ _${new Date().toLocaleString()}_

💡 Strong momentum detected!`;
  }

  private async sendMessage(text: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: text,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("❌ Telegram API error:", error);
        return false;
      }

      console.log("✅ Telegram notification sent successfully");
      return true;
    } catch (error) {
      console.error("❌ Error sending Telegram message:", error);
      return false;
    }
  }

  isEnabled(): boolean {
    return this.isConfigured;
  }
}

export const telegramNotifier = new TelegramNotifier();
