import { Editor, Notice, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, PleaseLoveLifeSettingTab, PleaseLoveLifeSettings } from "./settings";
import { DailyPhotoService } from "./services/photo-service";
import { DailyQuoteService } from "./services/quote-service";
import { PlaceholderResolver } from "./templates/placeholder-resolver";

export default class PleaseLoveLifePlugin extends Plugin {
	settings: PleaseLoveLifeSettings;
	private quoteService: DailyQuoteService;
	private photoService: DailyPhotoService;
	private placeholderResolver: PlaceholderResolver;
	private resolvingFiles: Set<string> = new Set();

	async onload() {
		await this.loadSettings();

		this.quoteService = new DailyQuoteService(this);
		this.photoService = new DailyPhotoService(this);
		this.placeholderResolver = new PlaceholderResolver(this, this.quoteService, this.photoService);

		this.addCommand({
			id: "please-love-life-resolve-placeholders",
			name: "Resolve quote and photo placeholders in current note",
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (!file || file.extension !== "md") {
					return false;
				}

				if (!checking) {
					void this.placeholderResolver.resolveFile(file);
				}
				return true;
			},
		});

		this.addCommand({
			id: "please-love-life-insert-todays-quote",
			name: "Insert today's quote",
			editorCallback: (editor: Editor) => {
				void this.insertQuote(editor);
			},
		});

		this.addCommand({
			id: "please-love-life-insert-todays-photo",
			name: "Insert today's photo",
			editorCallback: (editor: Editor) => {
				void this.insertPhoto(editor);
			},
		});

		this.addSettingTab(new PleaseLoveLifeSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(
				this.app.vault.on("create", (file) => {
					void this.maybeResolveByEvent(file, 300);
				}),
			);
			this.registerEvent(
				this.app.vault.on("modify", (file) => {
					void this.maybeResolveByEvent(file, 150);
				}),
			);
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<PleaseLoveLifeSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async maybeResolveByEvent(file: unknown, delayMs: number) {
		if (!(file instanceof TFile) || !this.settings.autoResolveOnCreate || file.extension !== "md") {
			return;
		}

		const path = file.path;
		if (this.resolvingFiles.has(path)) {
			return;
		}

		this.resolvingFiles.add(path);
		try {
			window.setTimeout(async () => {
				try {
					await this.placeholderResolver.resolveFile(file);
				} catch (error) {
					console.error("please-love-life: failed to resolve placeholders", error);
				} finally {
					this.resolvingFiles.delete(path);
				}
			}, delayMs);
		} catch (error) {
			this.resolvingFiles.delete(path);
			console.error("please-love-life: failed to schedule placeholder resolving", error);
		}
	}

	private async insertQuote(editor: Editor) {
		try {
			const quote = await this.quoteService.getTodayQuoteMarkdown();
			editor.replaceSelection(quote);
		} catch (error) {
			console.error("please-love-life: failed to insert quote", error);
			new Notice("Failed to fetch today's quote.");
		}
	}

	private async insertPhoto(editor: Editor) {
		try {
			const photo = await this.photoService.getTodayPhotoMarkdown();
			editor.replaceSelection(photo);
		} catch (error) {
			console.error("please-love-life: failed to insert photo", error);
			new Notice("Failed to fetch today's photo.");
		}
	}
}
