import { ChatGPTAPI } from "chatgpt"
import { Telegraf } from "telegraf"
import { createClient } from "redis"

import text from "./inputs/text.js"
import mention from "./inputs/mention.js"

const api = new ChatGPTAPI({ apiKey: process.env.OPENAI_API_KEY, debug: true, completionParams: { model: "gpt-4" }})
const bot = new Telegraf(process.env.TELEGRAM_API_KEY)
const redis = createClient({ url: "redis://:" + process.env.REDIS_PASSWORD + "@" + process.env.REDIS + ":6379" })

redis.on("error", error => console.log("🛑 ERROR REDIS", error))
await redis.connect()

bot.start((ctx) => ctx.reply("Hello."))

text(bot, api, redis)
mention(bot, api, redis)

bot.launch()

console.log("❇️  BOT STARTED")

const termination = (sig) => { return async () => { await redis.disconnect();bot.stop(sig) } }
process.once("SIGINT", termination("SIGINT"))
process.once("SIGTERM", termination("SIGTERM"))