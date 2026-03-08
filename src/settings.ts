import { App, PluginSettingTab, Setting } from "obsidian";
import PleaseLoveLifePlugin from "./main";

export interface QuoteCache {
	date: string;
	markdown: string;
}

export interface PhotoCache {
	date: string;
	markdown: string;
}

export interface PleaseLoveLifeSettings {
	autoResolveOnCreate: boolean;
	quotePlaceholder: string;
	photoPlaceholder: string;
	quoteApiUrl: string;
	quoteApiKey: string;
	photoApiUrl: string;
	photoApiKey: string;
	downloadPhotoToVault: boolean;
	photoWidth: number;
	photoHeight: number;
	quoteCache: QuoteCache | null;
	photoCache: PhotoCache | null;
}

export const DEFAULT_SETTINGS: PleaseLoveLifeSettings = {
	autoResolveOnCreate: true,
	quotePlaceholder: "{{pll_quote}}",
	photoPlaceholder: "{{pll_photo}}",
	quoteApiUrl: "https://zenquotes.io/api/today",
	quoteApiKey: "",
	photoApiUrl: "https://picsum.photos/seed/{date}/{width}/{height}",
	photoApiKey: "",
	downloadPhotoToVault: true,
	photoWidth: 1280,
	photoHeight: 720,
	quoteCache: null,
	photoCache: null,
};

export class PleaseLoveLifeSettingTab extends PluginSettingTab {
	plugin: PleaseLoveLifePlugin;

	constructor(app: App, plugin: PleaseLoveLifePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("自动替换占位符")
			.setDesc("创建新的 Markdown 文件时，自动替换名言和图片占位符。")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.autoResolveOnCreate).onChange(async (value) => {
					this.plugin.settings.autoResolveOnCreate = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("名言占位符")
			.setDesc("用于替换为今日名言的占位符文本。")
			.addText((text) =>
				text.setValue(this.plugin.settings.quotePlaceholder).onChange(async (value) => {
					this.plugin.settings.quotePlaceholder = value.trim() || DEFAULT_SETTINGS.quotePlaceholder;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("图片占位符")
			.setDesc("用于替换为今日图片 Markdown 的占位符文本。")
			.addText((text) =>
				text.setValue(this.plugin.settings.photoPlaceholder).onChange(async (value) => {
					this.plugin.settings.photoPlaceholder = value.trim() || DEFAULT_SETTINGS.photoPlaceholder;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("名言 API 地址")
			.setDesc("返回今日名言的 API 地址。支持变量 {apiKey}。")
			.addText((text) =>
				text.setValue(this.plugin.settings.quoteApiUrl).onChange(async (value) => {
					this.plugin.settings.quoteApiUrl = value.trim() || DEFAULT_SETTINGS.quoteApiUrl;
					this.plugin.settings.quoteCache = null;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("名言 API Key")
			.setDesc("可选。申请后填入；会同时尝试 Header 和 URL 变量方式。")
			.addText((text) =>
				text.setPlaceholder("可选").setValue(this.plugin.settings.quoteApiKey).onChange(async (value) => {
					this.plugin.settings.quoteApiKey = value.trim();
					this.plugin.settings.quoteCache = null;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("图片 API 地址")
			.setDesc("图片接口地址。支持变量 {date}、{width}、{height}、{apiKey}。")
			.addText((text) =>
				text.setValue(this.plugin.settings.photoApiUrl).onChange(async (value) => {
					this.plugin.settings.photoApiUrl = value.trim() || DEFAULT_SETTINGS.photoApiUrl;
					this.plugin.settings.photoCache = null;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("图片 API Key")
			.setDesc("可选。申请后填入；会同时尝试 Header 和 URL 变量方式。")
			.addText((text) =>
				text.setPlaceholder("可选").setValue(this.plugin.settings.photoApiKey).onChange(async (value) => {
					this.plugin.settings.photoApiKey = value.trim();
					this.plugin.settings.photoCache = null;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("下载图片到仓库")
			.setDesc("将今日图片保存到当前仓库，并插入本地嵌入链接。")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.downloadPhotoToVault).onChange(async (value) => {
					this.plugin.settings.downloadPhotoToVault = value;
					this.plugin.settings.photoCache = null;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("图片宽度")
			.setDesc("生成图片的宽度（像素）。")
			.addText((text) =>
				text.setValue(String(this.plugin.settings.photoWidth)).onChange(async (value) => {
					const parsed = Number.parseInt(value, 10);
					if (Number.isFinite(parsed) && parsed > 0) {
						this.plugin.settings.photoWidth = parsed;
						this.plugin.settings.photoCache = null;
						await this.plugin.saveSettings();
					}
				}),
			);

		new Setting(containerEl)
			.setName("图片高度")
			.setDesc("生成图片的高度（像素）。")
			.addText((text) =>
				text.setValue(String(this.plugin.settings.photoHeight)).onChange(async (value) => {
					const parsed = Number.parseInt(value, 10);
					if (Number.isFinite(parsed) && parsed > 0) {
						this.plugin.settings.photoHeight = parsed;
						this.plugin.settings.photoCache = null;
						await this.plugin.saveSettings();
					}
				}),
			);
	}
}
