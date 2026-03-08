import { TFile } from "obsidian";
import PleaseLoveLifePlugin from "../main";
import { DailyPhotoService } from "../services/photo-service";
import { DailyQuoteService } from "../services/quote-service";

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

		const hasQuote = quotePlaceholder.length > 0 && source.includes(quotePlaceholder);
		const hasPhoto = photoPlaceholder.length > 0 && source.includes(photoPlaceholder);
		if (!hasQuote && !hasPhoto) {
			return false;
		}

		const quoteMarkdown = hasQuote ? await this.quoteService.getTodayQuoteMarkdown() : "";
		const photoMarkdown = hasPhoto ? await this.photoService.getTodayPhotoMarkdown() : "";

		await this.plugin.app.vault.process(file, (content) => {
			let next = content;
			if (hasQuote) {
				next = next.split(quotePlaceholder).join(quoteMarkdown);
			}
			if (hasPhoto) {
				next = next.split(photoPlaceholder).join(photoMarkdown);
			}
			return next;
		});

		return true;
	}
}
