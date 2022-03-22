require("dotenv").config()
const axios = require("axios");
const Discord = require("discord.js");
const client = new Discord.Client({ intents: 32767 });
const api_ver = 1;
const api_key = process.env.TATSU_KEY
const guild_id = process.env.GUILD_ID;
const leaderboard_ch_id = process.env.CHANNEL_ID;
const Canvas = require("canvas");

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)

    client.channels.cache.get(leaderboard_ch_id).messages.fetch().then(x => x.filter(y => y.author.id == client.user.id).forEach(z => z.delete()))

    function tatsu_leaderboard() {
        try {
            axios.get(`https://api.tatsu.gg/v${api_ver}/guilds/${guild_id}/rankings/all?offset=0`, {
                headers: {
                    Authorization: api_key,
                }
            }).then(x => {

                rank = x.data.rankings

                client.guilds.fetch(guild_id).then(async c => {
                    const canvas = Canvas.createCanvas(1280, 700)
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(await Canvas.loadImage('https://cdn.discordapp.com/attachments/950003993239777340/951820776720457778/Untitled2_20220218205227.png'), 0, 0, canvas.width, canvas.height)
                    ctx.drawImage(await Canvas.loadImage(`./assets/black.png`), 0, 0, canvas.width, canvas.height)
                    Canvas.registerFont(`./assets/futura-bold.ttf`, { family: "Futura Book" })

                    for (i = 0; i < (rank.length > 10 ? 10 : rank.length); i++) {
                         let req = await axios.get(`https://discord.com/api/v8/users/${rank[i].user_id}`, {
                            headers: {
                                Authorization: `Bot ${client.token}`,
                            }
                        })
                        let nick = req.data.username
                        ctx.fillStyle = i == 0 ? "#ffe000" : i == 1 ? "#C0C0C0" : i == 2 ? "#CD7F32" : "#ffffff"
                        ctx.font = '35px "Futura Book"'
                        ctx.fillText(`#${i + 1} ${nick.length > 10 ? nick.substring(0, 10) + '...' : nick} • ${rank[i].score}`, i > 4 ? 720 : 120, ((i + 1) - (i > 4 ? 5 : 0)) * 100 + 50)
                    }

                    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), "leaderboard.png");
                    const embed = new Discord.MessageEmbed()

                        .setTitle(`${client.guilds.cache.get(guild_id).name} Leaderboard`)
                        .setColor("GREEN")
                        .setImage(`attachment://${attachment.name}`)


                    c.channels.cache.get(leaderboard_ch_id).send({ embeds: [embed], files: [attachment] }).then(m => {
                        setTimeout(function () {
                            tatsu_leaderboard()
                            m.delete()
                        }, 3600000) //1 hour
                    })
                })
            })
        } catch (e) {
            console.log("There's an error while trying to run tatsu_leaderboard function:\n" + e)
        }
    }

    tatsu_leaderboard()
    console.log("Auto Tatsu Leaderboard has started")
})

client.login(process.env.BOT_TOKEN)


