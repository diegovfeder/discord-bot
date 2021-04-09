const Discord = require("discord.js")
const keepAlive = require("./server")
const Database = require("@replit/database")

const db = new Database()
const client = new Discord.Client()


const triggerWords = ["doug", "gralha"]

// TODO: add @mentions
const initialMessages = [
  "O doug é o mais gralha...",
  "QUARENTCHA!",
]

// Initiate db (messages) with initialMessages
db.get("messages").then(messages => {
  if (!messages || messages.length < 1) {
    db.set("messages", initialMessages)
  }
})

db.get("responding").then(value => {
  if (value == null) {
    db.set("responding", true)
  }
})


// HELPER FUNCTIONS
// TODO: Check if message is already on db to update.
function updateMessages(newMessage) {
  db.get("messages").then(messages => {
    messages.push([newMessage])
    db.set("messages", messages)
  })
}

function deleteMessage(index) {
  db.get("messages").then(messages => {
    if (messages.length > index) {
      messages.splice(index, 1)
      db.set("messages", messages)
    }
  })  
}

// MAIN
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {
  if (msg.author.bot) return

  db.get("responding").then(responding =>{
    if (responding && triggerWords.some(word => msg.content.includes(word))) {
      db.get("messages").then(messages => {
        const response = messages[Math.floor(Math.random() * messages.length)]
        msg.reply(response)
      })
    }
  })


  if (msg.content.startsWith("$new")) {
    newMessage = msg.content.split("$new ")[1]
    updateMessages(newMessage)
    msg.channel.send("New encouraging message added.")
  }

  if (msg.content.startsWith("$del")) {
    index = parseInt(msg.content.split("$del ")[1])
    deleteMessage(index)
    msg.channel.send("Encouraging message deleted.")
  }

  if (msg.content.startsWith("$list")) {
    db.get("messages").then(messages => {
      msg.channel.send(messages)
    })
  }

  if (msg.content.startsWith("$responding")) {
    value = msg.content.split("$responding ")[1]

    if (value.toLowerCase() == "true") {
      db.set("responding", true)
      msg.channel.send("Responding is on.")
    } else {
       db.set("responding", false)
      msg.channel.send("Responding is off.")     
    }
  }

})

keepAlive()
client.login(process.env.TOKEN)