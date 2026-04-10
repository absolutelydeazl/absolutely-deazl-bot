export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      Utils
   }) => {
      try {
         const isVirtex = body && groupSet.antivirtex && (
            body.match(/(৭৭৭৭৭৭৭৭|๒๒๒๒๒๒๒๒|๑๑๑๑๑๑๑๑|ดุท้่เึางืผิดุท้่เึางื)/gi) ||
            body.length > 10000
         )

         if (!m.fromMe && isVirtex) {
            await client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: false,
                  id: m.key.id,
                  participant: m.sender
               }
            })
            await client.sendMessage(m.chat, {
               text: [
                  '⚠️ *تحذير | حماية المجموعة*',
                  '',
                  '━━━━━━━━━━━━━━━━━━━━━━',
                  `🚫 @${m.sender.split('@')[0]}، تم حذف رسالتك لأنها تحتوي على محتوى ضار أو رسالة فيروسية.`,
                  '━━━━━━━━━━━━━━━━━━━━━━',
                  'يرجى الالتزام بقواعد المجموعة! 🙏'
               ].join('\n'),
               mentions: [m.sender]
            })
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   botAdmin: true
}
