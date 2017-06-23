import ngrok   from 'ngrok'
import request from 'request'
import os      from 'os'
import auth    from '.auth.json'

const generateMessage = (url) => {
  return '*ngrok URL Tunneling*\n' +
    '以下のURLがトンネリングされています。\n' +
    '```\n' +
    `User: ${os.userInfo().username}\n` +
    ` URL: <${url}>\n` +
    (auth.basic ? `Auth: ${auth.basic}` : '') + '\n' +
    '```\n'
}

(() => {
  return new Promise((resolved, rejected) => {
    ngrok.connect({
      port: 3000,
      auth: auth.basic,
      authtoken: auth.ngrok
    }, (err, url) => {
      if (err) {
        rejected(new Error('ngrokへの接続に失敗したようです。ネットワーク接続状況や認証情報を見直してください。'))
      } else {
        resolved(url)
      }
    })
  })
})
  .then(url => {
    return new Promise((resolved, rejected) => {
      request
        .post(auth.slack.webhookUrl)
        .set('Content-type', 'application/json')
        .send({ text: generateMessage(url) })
        .end((err, res) => {
          if (err) {
            console.log(res)
            rejected(err)
          } else {
            resolved()
          }
        })
    })
  }).catch((err) => {
    console.log(err)
  })
