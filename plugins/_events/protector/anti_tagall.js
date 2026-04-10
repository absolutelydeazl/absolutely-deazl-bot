export const run = {
   async: async (m, {
      client,
      isAdmin,
      isOwner,
      Utils
   }) => {
      try {
         const isMassTag = m.mentionedJid.length > 10 || m.message?.[m.mtype || 'none']?.contextInfo?.nonJidMentions
         if (!isOwner && !isAdmin && isMassTag) {
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
                  `🚫 @${m.sender.split('@')[0]}، تم حذف رسالتك لأنها تحتوي على تاق جماعي لعدد كبير من الأعضاء.`,
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
