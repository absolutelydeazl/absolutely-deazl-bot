const VIOLATION_LIMIT = 20
const WARN_LIMIT = 5
const LOCK_DURATION = 5 * 60 * 1000 // 5 minutes

// Built-in Arabic bad words — always active
const ARABIC_BAD_WORDS = [
   'كسمك', 'متناك', 'عرص', 'خول', 'زاني', 'معرص', 'شرموطه', 'علق'
]

// Arabic-aware whole-word match using Unicode lookbehind/lookahead
// Ensures "علق" matches alone but NOT when attached to other letters like "علقيوسف"
const buildPattern = words => {
   const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
   return new RegExp(
      '(?<!\\p{L})(' + escaped.join('|') + ')(?!\\p{L})',
      'iu'
   )
}

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
         if (!groupSet.filter || !isBotAdmin || m.fromMe) return

         // Admins are exempt unless the group is currently locked
         // (in announcement mode only admins can post, so we still catch them)
         if (isAdmin && !groupSet.groupLocked) return

         // Combine database toxic list + built-in Arabic bad words
         const configToxic = setting.toxic || []
         const allToxic = [...new Set([...configToxic, ...ARABIC_BAD_WORDS])]

         if (!body || !allToxic.length) return

         const pattern = buildPattern(allToxic)
         if (!pattern.test(body)) return

         // Delete the message — NO kick, never
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

         // Arabic warning message
         await client.sendMessage(m.chat, {
            text: [
               '⚠️ *تحذير | كلمة مسيئة*',
               '',
               '━━━━━━━━━━━━━━━━━━━━━━',
               `🚫 @${m.sender.split('@')[0]}، تم حذف رسالتك لاحتوائها على ألفاظ مسيئة.`,
               `🚨 تحذيراتك الشخصية: *${personalWarn} / ${WARN_LIMIT}*`,
               `📊 مخالفات المجموعة: *${groupCount} / ${VIOLATION_LIMIT}*`,
               '━━━━━━━━━━━━━━━━━━━━━━',
               'يرجى الالتزام بآداب الحديث واحترام الجميع! 🙏'
            ].join('\n'),
            mentions: [m.sender]
         })

         // Lock group when violations hit the limit (no kick — only close group)
         if (groupCount >= VIOLATION_LIMIT && !groupSet.groupLocked) {
            groupSet.violationCount = 0
            groupSet.groupLocked = true
            await client.groupSettingUpdate(m.chat, 'announcement')
            await client.sendMessage(m.chat, {
               text: '🔒 *تم إغلاق المجموعة لمدة 5 دقائق بسبب كثرة المخالفات (20/20). لنحافظ على النظافة! ⏳*'
            })
            setTimeout(async () => {
               try {
                  groupSet.groupLocked = false
                  await client.groupSettingUpdate(m.chat, 'not_announcement')
                  await client.sendMessage(m.chat, {
                     text: '🔓 *تم فتح المجموعة مجددًا. تم إعادة تعيين عداد المخالفات. حافظوا على الاحترام! ✅*'
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
