import { TFile } from "obsidian";
import PleaseLoveLifePlugin from "../main";
import { DailyPhotoService } from "../services/photo-service";
import { DailyQuoteService } from "../services/quote-service";

const QUOTE_NEW_PLACEHOLDER = "{{pll_quote_new}}";
const PHOTO_NEW_PLACEHOLDER = "{{pll_photo_new}}";

export class PlaceholderResolver {
	private plugin: PleaseLoveLifePlugin;
	private quoteService: DailyQuoteService;
	private photoService: DailyPhotoService;

	constructor(plugin: PleaseLoveLifePlugin, quoteService: DailyQuoteService, photoService: DailyPhotoService) {
		this.plugin = plugin;
		this.quoteService = quoteService;
		this.photoService = photoService;
	}

	async resolveFile(file: TFile): Promise<boolean> {
		const source = await this.plugin.app.vault.cachedRead(file);
		const quotePlaceholder = this.plugin.settings.quotePlaceholder;
		const photoPlaceholder = this.plugin.settings.photoPlaceholder;
		const hasQuoteNew = source.includes(QUOTE_NEW_PLACEHOLDER);
		const hasPhotoNew = source.includes(PHOTO_NEW_PLACEHOLDER);

		const hasQuote = quotePlaceholder.length > 0 && source.includes(quotePlaceholder);
		const hasPhoto = photoPlaceholder.length > 0 && source.includes(photoPlaceholder);
		if (!hasQuote && !hasPhoto && !hasQuoteNew && !hasPhotoNew) {
			return false;
		}

		let quoteMarkdown = "";
		if (hasQuoteNew) {
			quoteMarkdown = await this.quoteService.getFreshQuoteMarkdown();
		} else if (hasQuote) {
			quoteMarkdown = await this.quoteService.getTodayQuoteMarkdown();
		}

		let photoMarkdown = "";
		if (hasPhotoNew) {
			photoMarkdown = await this.photoService.getFreshPhotoMarkdown();
		} else if (hasPhoto) {
			photoMarkdown = await this.photoService.getTodayPhotoMarkdown();
		}

		await this.plugin.app.vault.process(file, (content) => {
			let next = content;
			if (hasQuoteNew) {
				next = next.split(QUOTE_NEW_PLACEHOLDER).join(quoteMarkdown);
			}
			if (hasQuote) {
				next = next.split(quotePlaceholder).join(quoteMarkdown);
			}
			if (hasPhotoNew) {
				next = next.split(PHOTO_NEW_PLACEHOLDER).join(photoMarkdown);
			}
			if (hasPhoto) {
				next = next.split(photoPlaceholder).join(photoMarkdown);
			}
			return next;
		});

		return true;
	}
}
