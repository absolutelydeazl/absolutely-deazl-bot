export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      isAdmin
   }) => {
      try {
         const regex = /\bhttps?:\/\/(?:chat\.whatsapp\.com\/[a-zA-Z0-9]+|wa\.me\/[0-9]+|whatsapp\.com\/channel\/[a-zA-Z0-9]+)/gi
         const cleanUrl = url => {
            const urlObj = new URL(url)
            urlObj.search = ''
            return urlObj.toString()
         }

         const getGroupId = url => {
            const match = url.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/)
            return match ? match[1] : null
         }

         const deleteAndRecord = async () => {
            await client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: false,
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

         if (!isAdmin) {
            const match = body?.match(regex) || m?.msg?.name?.match(regex)
            if (match) {
               let deleted = false
               for (const url of match) {
                  const link = cleanUrl(url)
                  if (/chat/.test(url)) {
                     const invite = await client.groupInviteCode(m.chat)
                     if (getGroupId(link) !== invite && !deleted) {
                        await deleteAndRecord()
                        deleted = true
                     }
                  } else if (!deleted) {
                     await deleteAndRecord()
                     deleted = true
                  }
               }
            }
         }
      } catch (e) { }
   },
   error: false,
   group: true,
   botAdmin: true
}
