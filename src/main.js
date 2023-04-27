import { Telegraf } from 'telegraf';
import config from 'config';
import { message } from 'telegraf/filters';
import { ogg } from './ogg.js';
import { openai } from './openai.js';
import { code } from 'telegraf/format';

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.on(message('voice'), async ctx => {
	try {
		await ctx.reply(code('Формирую ответ...'));
		const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
		const userId = String(ctx.message.from.id);

		const oggPath = await ogg.create(link.href, userId);
		const mp3Path = await ogg.toMp3(oggPath, userId);

		const text = await openai.transcription(mp3Path);
		await ctx.reply(code(`Ваш запрос: ${text}`));
		const messages = [{ role: openai.roles.USER, content: text }];
		const response = await openai.chat(messages);

		await ctx.reply(response.content);
	} catch (error) {
		console.log('Error while voice message', e.message);
	}
});

bot.command('start', async ctx => {
	await ctx.reply(JSON.stringify('Не сомневайся во мне!'));
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
