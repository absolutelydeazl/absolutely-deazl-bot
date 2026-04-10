export const run = {
   usage: ['sider'],
   use: '(option)',
   category: 'admin tools',
   async: async (m, {
      client,
      isPrefix,
      command,
      participants,
      Utils
   }) => {
      try {
         const member = participants.filter(v => !v.admin).map(v => v.id)
         const day = 86400000 * 7
         const now = new Date() * 1
         let sider1 = [], sider2 = []
         const group = global.db.groups.find(x => x.jid === m.chat)
         member.filter(v => group.member[v]).map(v => sider1.push({
            jid: v,
            ...group.member[v]
         }))
         member.filter(v => !group.member[v]).map(v => sider2.push(v))
         const lastseen = sider1.filter(v => v.lastseen).sort((a, b) => a.lastseen - b.lastseen).filter(x => x.lastseen > 0).filter(x => now - x.lastseen > day).filter(x => x.jid != client.decodeJid(client.user.id))

         if (sider2.length == 0 && lastseen.length == 0) return client.reply(m.chat, Utils.texted('bold', `🚩 There is no sider in this group.`), m)
         let teks = `乂  *S I D E R*\n\n`
         teks += sider2.length == 0 ? '' : `"List of *${sider2.length}* members no activity."\n\n`
         teks += sider2.length == 0 ? '' : sider2.map(v => ' ◦  @' + v.replace(/@.+/, '')).join('\n') + '\n\n'
         teks += lastseen.length == 0 ? '' : `"List of *${lastseen.length}* members not online for 1 week."\n\n`
         teks += lastseen.length == 0 ? '' : lastseen.map(v => '     ◦  @' + v.jid.replace(/@.+/, '') + '\n       *Lastseen* : ' + Utils.toDate(now - v.lastseen).split('D')[0] + ' days ago').join('\n') + '\n\n'
         teks += `\n\n${global.footer}`
         client.reply(m.chat, teks, m)
      } catch (e){
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   admin: true,
   group: true
}
