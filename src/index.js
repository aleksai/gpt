import { ChatGPTAPI } from "chatgpt"
import { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import { createClient } from "redis"

const onMessage = async (ctx) => {
	try {
		ctx.sendChatAction("typing")

		const conversationId = await redis.get("conversationId_" + ctx.message.chat.id)
		const parentMessageId = await redis.get("parentMessageId_" + ctx.message.chat.id)

		const res = await api.sendMessage(ctx.message.text, conversationId && parentMessageId ? { conversationId, parentMessageId } : {})

		await redis.set("conversationId_" + ctx.message.chat.id, res.conversationId)
		await redis.set("parentMessageId_" + ctx.message.chat.id, res.id)

		ctx.reply(res.text)
	} catch(error) {
		console.log("ERROR", error)

		ctx.reply("Try again later")
	}
}

const api = new ChatGPTAPI({ apiKey: process.env.OPENAI_API_KEY })
const bot = new Telegraf(process.env.TELEGRAM_API_KEY)
const redis = createClient({ url: "redis://" + process.env.REDIS_PASSWORD + "@" + process.env.REDIS })

redis.on("error", error => console.log("Redis Client Error", error))

await redis.connect()

bot.start((ctx) => ctx.reply("Hello."))
bot.on(message("text"), onMessage)
bot.launch()

process.once("SIGINT", async () => {
	await redis.disconnect()
	bot.stop("SIGINT")
})
process.once("SIGTERM", async () => {
	await redis.disconnect()
	bot.stop("SIGTERM")
})