import { Notice, RequestUrlParam, requestUrl } from "obsidian";
import PleaseLoveLifePlugin from "../main";
import { getTodayKey } from "../utils/date";

interface ZenQuote {
	q?: string;
	a?: string;
}

const FALLBACK_QUOTES: Array<{ text: string; author: string }> = [
	{ text: "As long as your direction is right, every small step counts.", author: "Unknown" },
	{ text: "A journey of a thousand miles begins with a single step.", author: "Laozi" },
	{ text: "Tiny flowers still bloom with full strength.", author: "Yuan Mei" },
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

	async getFreshQuoteMarkdown(): Promise<string> {
		const today = getTodayKey();
		const markdown = await this.fetchQuoteMarkdown(today);
		this.plugin.settings.quoteCache = { date: today, markdown };
		await this.plugin.saveSettings();
		return markdown;
	}

	private async fetchQuoteMarkdown(today: string): Promise<string> {
		try {
			const response = await requestUrl(this.buildRequest());
			const record = this.readQuote(response.json as unknown);
			if (!record) {
				throw new Error("Quote API returned unexpected data");
			}
			return this.toCallout(record.text, record.author);
		} catch (error) {
			console.error("please-love-life: quote request failed", error);
			new Notice("Quote API request failed. Local fallback quote is used.");
			return this.fallbackQuote(today);
		}
	}

	private buildRequest(): RequestUrlParam {
		const apiKey = this.plugin.settings.quoteApiKey.trim();
		const url = this.plugin.settings.quoteApiUrl.split("{apiKey}").join(encodeURIComponent(apiKey));
		const request: RequestUrlParam = { url, method: "GET" };

		if (!apiKey) {
			return request;
		}

		request.headers = {
			"X-API-Key": apiKey,
			Authorization: `Bearer ${apiKey}`,
		};
		return request;
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

		if (typeof data !== "object" || data === null) {
			return null;
		}

		const obj = data as Record<string, unknown>;

		const hitokotoText = this.stringValue(obj.hitokoto);
		if (hitokotoText) {
			const fromWho = this.stringValue(obj.from_who);
			const from = this.stringValue(obj.from);
			return {
				text: hitokotoText,
				author: fromWho || from || "Hitokoto",
			};
		}

		const poemText = this.stringValue(obj.content);
		if (poemText) {
			const author = this.stringValue(obj.author);
			const origin = this.stringValue(obj.origin);
			return {
				text: poemText,
				author: author || origin || "Jinrishici",
			};
		}

		const genericText = this.stringValue(obj.quote) || this.stringValue(obj.text);
		if (genericText) {
			const genericAuthor = this.stringValue(obj.author) || this.stringValue(obj.source);
			return {
				text: genericText,
				author: genericAuthor || "Unknown",
			};
		}

		return null;
	}

	private stringValue(value: unknown): string {
		return typeof value === "string" ? value.trim() : "";
	}

	private fallbackQuote(today: string): string {
		const index = this.hash(today) % FALLBACK_QUOTES.length;
		const quote = FALLBACK_QUOTES[index];
		if (!quote) {
			return this.toCallout("Starting now is always better than waiting.", "Unknown");
		}
		return this.toCallout(quote.text, quote.author);
	}

	private toCallout(text: string, author: string): string {
		return [
			"> [!pll-quote] Today's energy",
			`> ${text}`,
			`> **- ${author}**`,
		].join("\n");
	}

	private hash(input: string): number {
		let result = 0;
		for (const char of input) {
			result = (result * 31 + char.charCodeAt(0)) >>> 0;
		}
		return result;
	}
}
