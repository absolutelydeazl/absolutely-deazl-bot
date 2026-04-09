export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      setting,
      isAdmin,
      isBotAdmin,
      Utils
   }) => {
      try {
         if (groupSet.filter && !isAdmin && isBotAdmin && !m.fromMe) {
            const toxic = setting.toxic || []
            if (body && (new RegExp('\\b' + toxic.join('\\b|\\b') + '\\b')).test(body.toLowerCase())) {
               if (!groupSet.member[m.sender]) groupSet.member[m.sender] = { warning: 0 }
               groupSet.member[m.sender].warning = (groupSet.member[m.sender].warning || 0) + 1
               const warning = groupSet.member[m.sender].warning

               await client.reply(m.chat, `乂  *W A R N I N G*\n\nYou got warning : [ ${Math.min(warning, 5)} / 5 ]\nYour message has been deleted.`, m)

               await client.sendMessage(m.chat, {
                  delete: {
                     remoteJid: m.chat,
                     fromMe: isBotAdmin ? false : true,
                     id: m.key.id,
                     participant: m.sender
                  }
               })

               groupSet.violationCount = (groupSet.violationCount || 0) + 1
               if (groupSet.violationCount >= 15) {
                  groupSet.violationCount = 0
                  await client.groupSettingUpdate(m.chat, 'announcement')
                  await client.sendMessage(m.chat, { text: '⚠️ This group has been locked for 5 minutes due to repeated violations.' })
                  setTimeout(async () => {
                     try {
                        await client.groupSettingUpdate(m.chat, 'not_announcement')
                        await client.sendMessage(m.chat, { text: '✅ Group is now open again.' })
                     } catch (e) {}
                  }, 5 * 60 * 1000)
               }
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   group: true
}
