import { message } from "telegraf/filters"

export default function text(bot, api, redis) {
	const onCommand = async (ctx) => {
		try {
			if(!ctx.message.entities) return ctx.reply("Something strange happens, code 003")

			for (var i = 0; i < ctx.message.entities.length; i++) {
				const entity = ctx.message.entities[i]
				
				if(entity.type === "bot_command") {
					const index = entity.length + 1

					if(ctx.message.text.length > index) {
						const context = ctx.message.text.substring(index)

						await redis.set("systemMessage_" + ctx.message.chat.id, context)

						return ctx.reply("Context saved")
					} else {
						await redis.del("systemMessage_" + ctx.message.chat.id)

						return ctx.reply("Context cleared")
					}
				}
			}

			ctx.reply("Something strange happens, code 002")
		} catch(error) {
			console.log("🛑 ERROR ON MESSAGE", error)

			ctx.reply("Something strange happens, code 001")
		}
	}

	bot.command("context", onCommand)
}