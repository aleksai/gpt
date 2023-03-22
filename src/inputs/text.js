import { message } from "telegraf/filters"

export default function text(bot, api, redis) {
	const isPrivateChat = (ctx) => {
		return ctx.message.chat.type === "private"
	}

	const isReply = (ctx) => {
		if(!ctx.message.reply_to_message) return false
		return ctx.message.reply_to_message.from.id === ctx.botInfo.id
	}

	const isMention = (ctx) => {
		if(!ctx.message.entities) return false
		for (var i = 0; i < ctx.message.entities.length; i++) {
			const entity = ctx.message.entities[i]
			if(entity.type === "mention") {
				const mention = ctx.message.text.substring(entity.offset, entity.length)
				if(mention === "@" + ctx.botInfo.username) return true
			}
		}
	}

	const onMessage = async (ctx) => {
		try {
			if(isPrivateChat(ctx) || isReply(ctx) || isMention(ctx)) {
				ctx.sendChatAction("typing")

				const parentMessageId = await redis.get("parentMessageId_" + ctx.message.chat.id)
				const systemMessage = await redis.get("systemMessage_" + ctx.message.chat.id)

				var options = {}

				if(parentMessageId) options.parentMessageId = parentMessageId
				if(systemMessage) options.systemMessage = systemMessage

				const res = await api.sendMessage(ctx.message.text, options)

				await redis.set("parentMessageId_" + ctx.message.chat.id, res.id)

				ctx.reply(res.text)
			}
		} catch(error) {
			console.log("🛑 ERROR ON MESSAGE", error)

			ctx.reply("Something strange happens, code 000")
		}
	}

	bot.on(message("text"), onMessage)
}