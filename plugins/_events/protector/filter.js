const VIOLATION_LIMIT = 20
const WARN_LIMIT = 5
const LOCK_DURATION = 5 * 60 * 1000 // 5 minutes

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
         if (!groupSet.filter || isAdmin || !isBotAdmin || m.fromMe) return

         const toxic = setting.toxic || []
         if (!body || !toxic.length) return

         const detected = new RegExp('\\b(' + toxic.join('|') + ')\\b', 'i').test(body)
         if (!detected) return

         // Delete the message — no kick
         await client.sendMessage(m.chat, {
            delete: {
               remoteJid: m.chat,
               fromMe: isBotAdmin ? false : true,
               id: m.key.id,
               participant: m.sender
            }
         })

         // Increment personal warning counter
         if (!groupSet.member[m.sender]) groupSet.member[m.sender] = { warning: 0 }
         groupSet.member[m.sender].warning = (groupSet.member[m.sender].warning || 0) + 1
         const personalWarn = Math.min(groupSet.member[m.sender].warning, WARN_LIMIT)

         // Increment shared group violation counter
         groupSet.violationCount = (groupSet.violationCount || 0) + 1
         const groupCount = groupSet.violationCount

         // Send a beautiful warning message
         await client.sendMessage(m.chat, {
            text: [
               '🤬 *BAD WORD DETECTED*',
               '',
               '━━━━━━━━━━━━━━━━━━━━━━',
               `⚠️ @${m.sender.split('@')[0]}, your message has been deleted.`,
               `🚨 Personal warnings: *${personalWarn} / ${WARN_LIMIT}*`,
               `📊 Group violations: *${groupCount} / ${VIOLATION_LIMIT}*`,
               '━━━━━━━━━━━━━━━━━━━━━━',
               'Keep the conversation clean! 💬'
            ].join('\n'),
            mentions: [m.sender]
         })

         // Lock group if violations hit the limit
         if (groupCount >= VIOLATION_LIMIT && !groupSet.groupLocked) {
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
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   group: true
}
