const VIOLATION_LIMIT = 20
const LOCK_DURATION = 5 * 60 * 1000 // 5 minutes

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

         const lockGroup = async () => {
            groupSet.violationCount = 0
            groupSet.groupLocked = true
            await client.groupSettingUpdate(m.chat, 'announcement')
            await client.sendMessage(m.chat, {
               text: '🔒 *The group is closed for 5 minutes due to excessive violations (20/20). Let\'s keep it clean! ⏳*'
            })
            setTimeout(async () => {
               try {
                  groupSet.groupLocked = false
                  await client.groupSettingUpdate(m.chat, 'not_announcement')
                  await client.sendMessage(m.chat, {
                     text: '🔓 *The group is now open again. Violation counter has been reset. Stay respectful! ✅*'
                  })
               } catch (e) {}
            }, LOCK_DURATION)
         }

         const deleteAndWarn = async () => {
            // Delete the message — no kick
            await client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: false,
                  id: m.key.id,
                  participant: m.sender
               }
            })

            // Increment shared group violation counter
            groupSet.violationCount = (groupSet.violationCount || 0) + 1
            const count = groupSet.violationCount

            // Send a beautiful warning message
            await client.sendMessage(m.chat, {
               text: [
                  '🔗 *LINK DETECTED*',
                  '',
                  '━━━━━━━━━━━━━━━━━━━━━━',
                  `⚠️ @${m.sender.split('@')[0]}, your message containing a link has been deleted.`,
                  '🚫 Sharing links is not allowed in this group.',
                  `📊 Group violations: *${count} / ${VIOLATION_LIMIT}*`,
                  '━━━━━━━━━━━━━━━━━━━━━━',
                  'Please respect the group rules! 🙏'
               ].join('\n'),
               mentions: [m.sender]
            })

            // Lock group if violations hit the limit
            if (count >= VIOLATION_LIMIT) {
               await lockGroup()
            }
         }

         if (!isAdmin && !groupSet.groupLocked) {
            const match = body?.match(regex) || m?.msg?.name?.match(regex)
            if (match) {
               let deleted = false
               for (const url of match) {
                  const link = cleanUrl(url)
                  if (/chat/.test(url)) {
                     const invite = await client.groupInviteCode(m.chat)
                     if (getGroupId(link) !== invite && !deleted) {
                        await deleteAndWarn()
                        deleted = true
                     }
                  } else if (!deleted) {
                     await deleteAndWarn()
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
