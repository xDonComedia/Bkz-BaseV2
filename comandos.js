const {default: makeWASocket, makeInMemoryStore, useMultiFileAuthState, delay, downloadContentFromMessage, DisconnectReason, templateMessage, MediaType, GroupSettingChange, isBaileys, WASocket, WAProto, getStream, relayWAMessage, Miimetype, proto, mentionedJid, processTime, MessageTypeProto, BufferJSON, GroupMetadata, getContentType} = require("@adiwajshing/baileys")

const P = require("pino")
const fs = require("fs")
const util = require("util")
const clui = require("clui")
const ms = require("ms")
const yts = require("yt-search")
const speed = require("performance-now")
const fetch = require("node-fetch")
const axios = require("axios")
const webp = require("node-webpmux")
const chalk = require("chalk")
const cfonts = require("cfonts")
const moment = require("moment-timezone")
const ffmpeg = require("fluent-ffmpeg")
const { Boom } = require("@hapi/boom")
const { exec, spawn, execSync } = require("child_process")
const { getBuffer, generateMessageTag, tempRuntime, clockString, color, fetchJson, getGroupAdmins, getRandom, parseMention, getExtension, banner, uncache, nocache, isFiltered, addFilter, ia } = require('./arquivos/funções/ferramentas')
const { prefixo, nomebot, nomedono, numerodono } = require('./arquivos/funções/configuração.json')

const options = { timeZone: 'America/Sao_Paulo', hour12: false }
const data = new Date().toLocaleDateString('pt-BR', { ...options, day: '2-digit', month: '2-digit', year: '2-digit' })
const hora = new Date().toLocaleTimeString('pt-BR', options)
const horaAtual = new Date().getHours()
const varping = speed()
const ping = speed() - varping
const timestamp = speed()
const latensi = speed() - timestamp

//Conexão
const MAX_RECONNECTION_ATTEMPTS = 3
let reconnectionAttempts = 0
async function connectToWhatsApp() {
const store = makeInMemoryStore({ logger: P().child({ level: "silent", stream: "store" }) 
})
console.log(banner.string)
const { state, saveCreds } = await useMultiFileAuthState('./arquivos/qr-code')
const bkz = makeWASocket({
logger: P({ level: "silent" }),
printQRInTerminal: true,
browser: ['Bkz-Base v2 - Bkz Modz Ϟ', 'macOS', 'desktop'],
auth: state
})
bkz.ev.on("creds.update", saveCreds)
store.bind(bkz.ev)
bkz.ev.on("chats.set", () => {
console.log("Tem conversas", store.chats.all())
})
bkz.ev.on("contacts.set", () => {
console.log("Tem contatos", Object.values(store.contacts))
})
bkz.ev.on("connection.update", (update) => {
const { connection, lastDisconnect } = update
if (connection === "close") {
const shouldReconnect = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
console.log("Conexão fechada erro:", lastDisconnect.error, "Tentando reconectar...", shouldReconnect)
if (shouldReconnect && reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
reconnectionAttempts++
setTimeout(connectToWhatsApp, 5000)
} else {
console.log("Falha na reconexão. Limite máximo de tentativas atingido.")}
} else if (connection === "open") {
console.log(color(`➱ Conectado com sucesso!\n• Status: online\n• Horário ligado: ${hora}\n• Bem-vindo ao ${nomebot}\n➱ Próximos logs...\n`, 'green'))}
})
bkz.ev.on('messages.upsert', async (m) => {

//Visualização da mensagem, etc...
try {
const info = m.messages[0]
if (!info.message) return 
await bkz.readMessages([info.key])
if (info.key && info.key.remoteJid == 'status@broadcast') return 
const type = Object.keys(info.message)[0] == 'senderKeyDistributionMessage' ? Object.keys(info.message)[2] : (Object.keys(info.message)[0] == 'messageContextInfo') ? Object.keys(info.message)[1] : Object.keys(info.message)[0]
const content = JSON.stringify(info.message)
const from = info.key.remoteJid

var body = (type === 'conversation') ? info.message.conversation : (type == 'imageMessage') ? info.message.imageMessage.caption : (type == 'videoMessage') ? info.message.videoMessage.caption : (type == 'extendedTextMessage') ? info.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? info.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? info.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? info.message.templateButtonReplyMessage.selectedId : ''

const budy = (type === 'conversation') ? info.message.conversation : (type === 'extendedTextMessage') ? info.message.extendedTextMessage.text : ''

var pes = (type === 'conversation' && info.message.conversation) ? info.message.conversation : (type == 'imageMessage') && info.message.imageMessage.caption ? info.message.imageMessage.caption : (type == 'videoMessage') && info.message.videoMessage.caption ? info.message.videoMessage.caption : (type == 'extendedTextMessage') && info.message.extendedTextMessage.text ? info.message.extendedTextMessage.text : ''

//Const isGroup, etc...
const isGroup = info.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? info.key.participant : info.key.remoteJid
const groupMetadata = isGroup ? await bkz.groupMetadata(from) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const groupDesc = isGroup ? groupMetadata.desc : ''
const groupMembers = isGroup ? groupMetadata.participants : ''
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
const nome = info.pushName ? info.pushName : ''
const messagesC = pes.slice(0).trim().split(/ +/).shift().toLowerCase()
const args = body.trim().split(/ +/).slice(1)
const q = args.join(' ')
const isCmd = body.startsWith(prefixo)
const comando = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null 
const mentions = (teks, memberr, id) => {
(id == null || id == undefined || id == false) ? bkz.sendMessage(from, {text: teks.trim(), mentions: memberr}) : bkz.sendMessage(from, {text: teks.trim(), mentions: memberr})}
const quoted = info.quoted ? info.quoted : info
const mime = (quoted.info || quoted).mimetype || ""
const sleep = async (ms) => {return new Promise(resolve => setTimeout(resolve, ms))}

//Outras const...
const isBot = info.key.fromMe ? true : false
const isOwner = numerodono.includes(sender)
const BotNumber = bkz.user.id.split(':')[0]+'@s.whatsapp.net'
const isGroupAdmins = groupAdmins.includes(sender) || false 
const isBotGroupAdmins = groupAdmins.includes(BotNumber) || false
const isUrl = (url) => { return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi')) }
const deviceType = info.key.id.length > 21 ? 'Android' : info.key.id.substring(0, 2) == '3A' ? 'IPhone' : 'WhatsApp web'

const enviar = (text) => {
bkz.sendMessage(from, {text: text}, {quoted: info})}

//Const isQuoted.
const isImage = type == "imageMessage"
const isVideo = type == "videoMessage"
const isAudio = type == "audioMessage"
const isSticker = type == "stickerMessage"
const isContact = type == "contactMessage"
const isLocation = type == "locationMessage"
const isProduct = type == "productMessage"
const isMedia = (type === "imageMessage" || type === "videoMessage" || type === "audioMessage") 
typeMessage = body.substr(0, 50).replace(/\n/g, "")
if (isImage) typeMessage = "Image"
else if (isVideo) typeMessage = "Video"
else if (isAudio) typeMessage = "Audio"
else if (isSticker) typeMessage = "Sticker"
else if (isContact) typeMessage = "Contact"
else if (isLocation) typeMessage = "Location"
else if (isProduct) typeMessage = "Product"
const isQuotedMsg = type === "extendedTextMessage" && content.includes("textMessage")
const isQuotedImage = type === "extendedTextMessage" && content.includes("imageMessage")
const isQuotedVideo = type === "extendedTextMessage" && content.includes("videoMessage")
const isQuotedDocument = type === "extendedTextMessage" && content.includes("documentMessage")
const isQuotedAudio = type === "extendedTextMessage" && content.includes("audioMessage")
const isQuotedSticker = type === "extendedTextMessage" && content.includes("stickerMessage")
const isQuotedContact = type === "extendedTextMessage" && content.includes("contactMessage")
const isQuotedLocation = type === "extendedTextMessage" && content.includes("locationMessage")
const isQuotedProduct = type === "extendedTextMessage" && content.includes("productMessage")

//Obtém o conteúdo de um arquivo em formato de buffer
const getFileBuffer = async (mediakey, MediaType) => {
const stream = await downloadContentFromMessage(mediakey, MediaType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk]) }
return buffer}

//Respostas de verificação
resposta = {
espere: "Por favor, aguarde um momento...",
registro: `Olá ${nome}, parece que você ainda não está registrado. Para fazer seu registro, utilize o comando ${prefixo}rg.`,
rg: "Oops! Parece que você já está registrado. Não é possível ter mais de um registro por usuário.",
premium: "Lamentamos, mas você não possui uma assinatura Premium. Este comando é exclusivo para usuários na lista Premium. Aproveite todos os benefícios de se tornar Premium!",
bot: "Este comando só pode ser executado pelo bot.",
dono: "Desculpe, mas apenas o dono do bot pode utilizar este comando.",
grupo: "Este comando só pode ser utilizado em grupos.",
privado: "Este comando só pode ser utilizado em conversas privadas.",
adm: "Apenas administradores do grupo podem utilizar este comando.",
botadm: "Este comando só pode ser utilizado quando o bot é um administrador do grupo.",
erro: "Desculpe, ocorreu um erro. Por favor, tente novamente mais tarde."}

//Verificação anti-spam
if (isCmd) {
if (isFiltered(sender)) {
return enviar('Sem flood amigo... agora espere 5 segundos.')
} else {
addFilter(sender)}}

//Mensagens do console
if (isGroup) {
if (isCmd && !isBot) {
console.log(
color(`\n ⟨ Comando em grupo ⟩`, 'yellow'),
color(`\n➱ Comando: ${comando}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Grupo: ${groupName}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))
} else if (!isBot) {
console.log(
color(`\n ⟨ Mensagem em grupo ⟩`, 'yellow'),
color(`\n➱ Comando: ${color('Não', 'red')}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Grupo: ${groupName}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))}
} else {
if (isCmd && !isBot) {
console.log(
color(`\n ⟨ Comando no privado ⟩`, 'yellow'),
color(`\n➱ Comando: ${comando}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))
} else if (!isBot) {
console.log(
color(`\n ⟨ Mensagem no privado ⟩`, 'yellow'),
color(`\n➱ Comando: ${color('Não', 'red')}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))}}

//Aqui começa os comandos com prefixo
switch(comando) {

//Menu
case 'menu':
menu = `╭──「 Menu Texto 」
│• Usuário: @${sender.split("@")[0]}
│• Dispositivo: ${deviceType}
│• Prefixo Atual: ${prefixo}
│• Resposta: ${latensi.toFixed(4)}
│• Nome Bot: ${nomebot}
╰ • Criador: ${nomedono}`
bkz.sendMessage(from, {text: menu, mentions: [sender]}, {quoted: info })
break

case 'menu2':
menu2 = `╭──「 Menu Foto - Link 」
│• Usuário: @${sender.split("@")[0]}
│• Dispositivo: ${deviceType}
│• Prefixo Atual: ${prefixo}
│• Resposta: ${latensi.toFixed(4)}
│• Nome Bot: ${nomebot}
╰ • Criador: ${nomedono}`
bkz.sendMessage(from, {image: {url: 'https://telegra.ph/file/414bd9e7830c4d828b535.jpg' }, caption: menu2, mentions: [sender]}, {quoted: info })
break

case 'menu3':
menu3 = `╭──「 Menu Foto - Diretório 」
│• Usuário: @${sender.split("@")[0]}
│• Dispositivo: ${deviceType}
│• Prefixo Atual: ${prefixo}
│• Resposta: ${latensi.toFixed(4)}
│• Nome Bot: ${nomebot}
╰ • Criador: ${nomedono}`
bkz.sendMessage(from, {image: fs.readFileSync('./arquivos/logo.jpg'), caption: menu3, mentions: [sender]}, {quoted: info })
break

case 'texto':
bkz.sendMessage(from, {text: 'Seu texto aqui.' }, {quoted: info })
break

case 'audio':
bkz.sendMessage(from, {audio: fs.readFileSync('./arquivos/áudio.mp3')}, {quoted: info })
break

case 'audiovoz':
bkz.sendMessage(from, {audio: fs.readFileSync('./arquivos/áudio.mp3'), mimetype: 'audio/mp4', ptt:true }, {quoted: info })
break

case 'image':
bkz.sendMessage(from, {image: fs.readFileSync('./arquivos/logo.jpg')}, {quoted: info })
break

case 'video':
bkz.sendMessage(from, {video: fs.readFileSync('./arquivos/video.mp4')}, {quoted: info })
break

case 'videotexto':
bkz.sendMessage(from, {video: fs.readFileSync('./arquivos/video.mp4'), caption: 'Legenda'}, {quoted: info })
break

case 'figurinha':
bkz.sendMessage(from, {sticker: fs.readFileSync('./arquivos/figurinha.webp')}, {quoted: info })
break

case 'doc':
bkz.sendMessage(from, {document: fs.readFileSync('./arquivos/documento.zip'), fileName: 'Bkz-Base.zip', mimetype: 'application/zip'}, {quoted: info })
break

case 'loc':
bkz.sendMessage(from, {location: fs.readFileSync('./arquivos/localização.loc'), caption: 'Localização'}, {quoted: info })
break

case 'enquete': 
message = {
"messageContextInfo": {
"messageSecret": "eed1zxI49cxiovBTUFLIEWi1shD9HgIOghONuqPDGTk="},
"pollCreationMessage": {
"options": [
{ "optionName": 'Opção 1' },
{ "optionName": 'Opção 2' },
{ "optionName": 'Opção 3' }],
"name": `${data}`,
"selectableOptionsCount": 0
}}
await bkz.relayMessage(from, message, {quoted: info })
break

case 'reiniciar':
if (!isOwner) return enviar(resposta.dono)
enviar('Reiniciando...')
await delay(2000)
process.exit()
break

//Aqui é o fim dos comandos sem prefixo, e começo dos sem prefixo
default:

if (body.startsWith('>')){
try {
if (info.key.fromMe) return 
if (!isOwner) return 
return bkz.sendMessage(from, {text: JSON.stringify(eval(body.slice(2)),null,'\t')}).catch(e => {
return enviar(String(e))})
} catch (e){
return enviar(String(e))}}
}
} catch (e) {
e = String(e)
if (e.includes('this.isZero')) {
return
}
console.error('\n %s', color(`➱ ${e}`, 'yellow'))
console.log(color('\n « ! Crashlog ! »', 'red'), (color('Erro detectado! \n', 'yellow')))
bkz.sendMessage(`${numerodono}`, {text: `Ocorreu um erro: ${e}`})}
})}
connectToWhatsApp()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`O arquivo ${__filename} foi atualizado.\n`)
process.exit()
})