import { chromium } from "playwright";
import fetch from "node-fetch";
import FormData from "form-data";
import { mkdirSync, existsSync, createReadStream } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";

dotenv.config();

const URL = process.env.URL;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function takeScreenshot(filePath) {
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(URL, { waitUntil: "domcontentloaded" });
	await page.screenshot({ path: filePath });
	await browser.close();
}

async function sendToTelegram(filePath) {
	const form = new FormData();
	const now = new Date().toLocaleString("ru-RU", {
		timeZone: "Asia/Omsk",
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	form.append("chat_id", CHAT_ID);
	form.append("photo", createReadStream(filePath));
	form.append("caption", `Скриншот от ${now}`);

	await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
		method: "POST",
		body: form,
		headers: form.getHeaders(),
	});
}

(async () => {
	const date = new Date().toISOString().split("T")[0];
	const dir = "./screenshots";

	if (!existsSync(dir)) mkdirSync(dir);

	const filePath = join(dir, `${date}.png`);

	await takeScreenshot(filePath);
	await sendToTelegram(filePath);

	console.log("Скриншот отправлен");
})();
