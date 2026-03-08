import { Notice, RequestUrlParam, requestUrl } from "obsidian";
import PleaseLoveLifePlugin from "../main";
import { getTodayKey } from "../utils/date";

interface ZenQuote {
	q?: string;
	a?: string;
}

const FALLBACK_QUOTES: Array<{ text: string; author: string }> = [
	{ text: "Small daily improvements are the key to long-term results.", author: "Unknown" },
	{ text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
	{ text: "The best way out is always through.", author: "Robert Frost" },
];

export class DailyQuoteService {
	private plugin: PleaseLoveLifePlugin;

	constructor(plugin: PleaseLoveLifePlugin) {
		this.plugin = plugin;
	}

	async getTodayQuoteMarkdown(): Promise<string> {
		const today = getTodayKey();
		const cached = this.plugin.settings.quoteCache;
		if (cached && cached.date === today) {
			return cached.markdown;
		}

		const markdown = await this.fetchQuoteMarkdown(today);
		this.plugin.settings.quoteCache = { date: today, markdown };
		await this.plugin.saveSettings();
		return markdown;
	}

	private async fetchQuoteMarkdown(today: string): Promise<string> {
		try {
			const apiKey = this.plugin.settings.quoteApiKey.trim();
			const url = this.plugin.settings.quoteApiUrl.split("{apiKey}").join(encodeURIComponent(apiKey));
			const request: RequestUrlParam = {
				url,
				method: "GET",
			};

			if (apiKey) {
				request.headers = {
					"X-API-Key": apiKey,
					Authorization: `Bearer ${apiKey}`,
				};
			}

			const response = await requestUrl(request);
			const json = response.json as unknown;
			const record = this.readQuote(json);
			if (!record) {
				throw new Error("Quote API returned unexpected data");
			}
			return `> "${record.text}"\n> - ${record.author}`;
		} catch (error) {
			console.error("please-love-life: quote request failed", error);
			new Notice("名言 API 请求失败，已使用本地兜底名言。");
			return this.fallbackQuote(today);
		}
	}

	private readQuote(data: unknown): { text: string; author: string } | null {
		if (Array.isArray(data) && data.length > 0) {
			const first = data[0] as ZenQuote;
			const text = first.q?.trim();
			const author = first.a?.trim();
			if (text) {
				return { text, author: author || "Unknown" };
			}
		}

		if (typeof data === "object" && data !== null) {
			const single = data as Record<string, unknown>;
			const text = typeof single.quote === "string" ? single.quote.trim() : "";
			const author = typeof single.author === "string" ? single.author.trim() : "";
			if (text) {
				return { text, author: author || "Unknown" };
			}
		}

		return null;
	}

	private fallbackQuote(today: string): string {
		const index = this.hash(today) % FALLBACK_QUOTES.length;
		const quote = FALLBACK_QUOTES[index];
		if (!quote) {
			return "> \"Keep moving forward.\"\n> - Unknown";
		}
		return `> "${quote.text}"\n> - ${quote.author}`;
	}

	private hash(input: string): number {
		let result = 0;
		for (const char of input) {
			result = (result * 31 + char.charCodeAt(0)) >>> 0;
		}
		return result;
	}
}
