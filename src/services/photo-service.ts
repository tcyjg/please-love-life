import { Notice, RequestUrlParam, TFile, TFolder, requestUrl } from "obsidian";
import PleaseLoveLifePlugin from "../main";
import { getTodayKey } from "../utils/date";

const PHOTO_FOLDER = "please-love-life-images";

export class DailyPhotoService {
	private plugin: PleaseLoveLifePlugin;

	constructor(plugin: PleaseLoveLifePlugin) {
		this.plugin = plugin;
	}

	async getTodayPhotoMarkdown(): Promise<string> {
		const today = getTodayKey();
		const cached = this.plugin.settings.photoCache;
		if (cached && cached.date === today) {
			return cached.markdown;
		}

		const width = this.plugin.settings.photoWidth;
		const height = this.plugin.settings.photoHeight;
		const photoUrl = this.buildPhotoUrl(today, width, height);
		const markdown = this.plugin.settings.downloadPhotoToVault
			? await this.getLocalPhotoMarkdown(today, width, height, photoUrl)
			: `![Today's inspiration](${photoUrl})`;

		this.plugin.settings.photoCache = {
			date: today,
			markdown,
		};
		await this.plugin.saveSettings();

		return markdown;
	}

	private buildPhotoUrl(today: string, width: number, height: number): string {
		const apiKey = this.plugin.settings.photoApiKey.trim();
		return this.plugin.settings.photoApiUrl
			.split("{date}")
			.join(encodeURIComponent(today))
			.split("{width}")
			.join(String(width))
			.split("{height}")
			.join(String(height))
			.split("{apiKey}")
			.join(encodeURIComponent(apiKey));
	}

	private async getLocalPhotoMarkdown(today: string, width: number, height: number, photoUrl: string): Promise<string> {
		try {
			await this.ensureFolderExists(PHOTO_FOLDER);
			const downloaded = await requestUrl(this.buildPhotoRequest(photoUrl));
			const extension = this.extensionFromContentType(downloaded.headers["content-type"]);
			const filePath = `${PHOTO_FOLDER}/photo-${today}-${width}x${height}.${extension}`;
			const existing = this.plugin.app.vault.getAbstractFileByPath(filePath);
			if (existing instanceof TFile) {
				return `![[${filePath}]]`;
			}

			await this.plugin.app.vault.createBinary(filePath, downloaded.arrayBuffer);
			return `![[${filePath}]]`;
		} catch (error) {
			console.error("please-love-life: failed to download local photo", error);
			new Notice("图片下载失败，已回退为远程图片链接。");
			return `![Today's inspiration](${photoUrl})`;
		}
	}

	private buildPhotoRequest(url: string): RequestUrlParam {
		const apiKey = this.plugin.settings.photoApiKey.trim();
		if (!apiKey) {
			return { url, method: "GET" };
		}

		return {
			url,
			method: "GET",
			headers: {
				"X-API-Key": apiKey,
				Authorization: `Client-ID ${apiKey}`,
			},
		};
	}

	private extensionFromContentType(contentType: string | undefined): string {
		if (!contentType) {
			return "jpg";
		}
		if (contentType.includes("png")) {
			return "png";
		}
		if (contentType.includes("webp")) {
			return "webp";
		}
		if (contentType.includes("gif")) {
			return "gif";
		}
		return "jpg";
	}

	private async ensureFolderExists(path: string): Promise<void> {
		const segments = path.split("/").filter((part) => part.length > 0);
		let current = "";

		for (const segment of segments) {
			current = current ? `${current}/${segment}` : segment;
			const existing = this.plugin.app.vault.getAbstractFileByPath(current);
			if (!existing) {
				await this.plugin.app.vault.createFolder(current);
			} else if (!(existing instanceof TFolder)) {
				throw new Error(`${current} exists and is not a folder`);
			}
		}
	}
}
