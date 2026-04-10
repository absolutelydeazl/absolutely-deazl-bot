export const run = {
   async: async (m, {
      client,
      groupSet,
      isAdmin,
      Utils
   }) => {
      try {
         if (groupSet.antitagsw && !isAdmin && /groupStatusMentionMessage/.test(m.mtype)) {
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
                  `🚫 @${m.sender.split('@')[0]}، تم حذف رسالتك لأنها تحتوي على تاق جماعي غير مسموح به.`,
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
