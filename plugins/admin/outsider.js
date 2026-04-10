export const run = {
   usage: ['outsider'],
   use: '(option)',
   category: 'admin tools',
   async: async (m, {
      client,
      participants,
      Utils
   }) => {
      try {
         let member = participants.filter(v => !v.admin).map(v => v.id).filter(v => !v.startsWith('62') && v != client.decodeJid(client.user.id))
         if (member.length == 0) return client.reply(m.chat, Utils.texted('bold', `🚩 This group is clean from outsiders.`), m)
         let teks = `✅ *${member.length}* outsiders found.\n\n`
         teks += member.map(v => '◦  @' + v.replace(/@.+/, '')).join('\n')
         client.reply(m.chat, teks, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   admin: true,
   group: true,
   botAdmin: true
}
