//Global var-s
const Discord = require('discord.js');  //discord 
const client = new Discord.Client();    //discord
const fetch = require('node-fetch');    //fetch request        

const api_url = 'https://cve.circl.lu/api/last';                        
const serch_link = "https://cve.mitre.org/cgi-bin/cvename.cgi?name="; // link for more info from the website

//only need for 30 day
let last_api = "";
let beginvar = true;
//only need for 30 day

let star = "🌟";        //  star
let MSG_Channel_ = "";  //   store channel id
var refreshIntervalId;  //   timer data


// 30 day bot start here
function loop_request(){
    let waisted_count = 0; // set to 0
    
    //requset from api
    async function StartR() 
    {
        // request, fetch api data
        const response = await fetch(api_url); //fetch
        const data = await response.json(); //api
        let json_split = JSON.parse(JSON.stringify(data)); // split api data

        // only for the first request
        if (beginvar == true){
            console.log("first try");
            render_call(json_split, waisted_count, beginvar);
            last_api = json_split[0].id;
            beginvar = false;   
        } 
        else{
            console.log("secound try");
            waisted_count = while_count(last_api, json_split);
            render_call(json_split, waisted_count, beginvar);
        }
        console.log("assync vege 15perc " + "Last API: " + last_api);
    }
    StartR();
}

//count index betveen the fist and the last count 
function while_count(old_id, json){
    let count = 0;

    if (old_id != json[0].id){
        //counting while equals or out of index
        while (old_id != json[count].id){
            count = count + 1;
            //help to owerloop
            if (count == json.length){
                console.log("its breaking 30 reached");
                break;
            }   
        }
    }
    else{
        console.log("false");
    }
    console.log(count);
    return count;
}

//json = json file, coutn = count betveen the virst and the last cve id, beginvar = is a first request?
function render_call(json, count, beginvar){

    //itt ha kell a for cikluson belul sosem fogja annyiszor elkuldeni az ertesitest ameddig nem egyezik 
    if (count != 0){
        const task = async (json) => {
            for (var i = count - 1; i + 1 > - i; i--){
                await new Promise(r => setTimeout(r, 3500));
                send_embed_30_day(json[i].id, json[i].summary, json[i].references);
            }
            console.log("vege a for loopnak");            
        }
        task(json);
        last_api = json[0].id;
        console.log("vegleges last api valtozo: " + last_api);
    }

    //mindig ez fut le ha nincs valtozas kiveve az elso alkalommal mivel akkor kell kiiratnia
    else
    {
        if (beginvar == true){
            // itt megtortenik az elso kiiratas
            send_embed_30_day(json[0].id, json[0].summary, json[0].references, json[0].cvss);
        }
        else{console.log("nincs valtozas");}
    }
    console.log("discord send end.");
}

//makeing 
function risk_stars(cvss){
    let star_count = "";
    for (var i = 0; i < cvss; i++) {
        star_count = star_count + star;
    }
    return star_count
}


function send_embed_30_day(cve_id, cve_summary, refer, cvss)
{
    //channel id itt will changed
    const channelid = client.channels.cache.find(channel => channel.id === MSG_Channel_);
    //channel id itt will changed

    const newEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .addFields(
            {name:'CVE Name', value: cve_id},
            {name:'Summary', value: cve_summary},
            {name:'Referencies', value: refer},
            {name:'Risk count (cvss)', value: "10/" + cvss, inline: true},
            {name:'Risk count (cvss)', value: risk_stars(cvss), inline: true},
            {name:'More info', value: serch_link + cve_id}
        )
        .setTimestamp()
        channelid.send(newEmbed);
        console.log("progress yes");
}

// loop last 30 cve, search function
function send_embed_search(message__){
    
    //channel id itt will changed
    const channelid = client.channels.cache.find(channel => channel.id === MSG_Channel_); //kicserelni ha nem mukodik '876913430437707807'
    //channel id itt will changed

    //request from api
    async function Search__() 
    {
        let cve_id_bein = "https://cve.circl.lu/api/cve/";
        
        const response = await fetch(cve_id_bein + message__);
        const data = await response.json();
        let json_split = JSON.parse(JSON.stringify(data));
        print_search(json_split.id, json_split.summary, json_split.references, json_split.cvss);
    }
    Search__();
    
    //print everything
    function print_search(id, summary, references, cvss){
        const newEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .addFields(
                //{name:'Date', value: days},
                {name:'CVE Name', value: id},
                {name:'Summary', value: summary},
                {name:'Referencies', value: references},
                {name:'Risk count (cvss)', value: "10/" + cvss, inline: true},
                {name:'Risk count (cvss)', value: risk_stars(cvss), inline: true},
                {name:'More info', value: serch_link + id}
            )
            .setTimestamp()
            channelid.send(newEmbed);
    }
}


//!help render
function Help_for(Channel_id){

    //channel id itt will changed
    const channelid = client.channels.cache.find(channel => channel.id === Channel_id);
    //channel id itt will changed

    const help_embed = new Discord.MessageEmbed()
        .setColor('#009E60')
        .addFields(
            {name:'!Help', value: "More info about this bot"},
            {name:'!Start', value: "Start sending neweset CVEs"},
            {name:'!Search {???}', value: "Search for any CVE"},
            {name:'!Status', value: ""}
        )
        //sg.channel.send(help_embed);
        channelid.send(help_embed);
        console.log("progress yes");
}

function Status(Channel_id){
    let color = ""; 
    let text = "";

    //channel id itt will changed
    const channelid = client.channels.cache.find(channel => channel.id === Channel_id);
    //channel id itt will changed
    
    //console.log(refreshIntervalId._idleTimeout);

    if (typeof refreshIntervalId === 'undefined'){
        color = "#BD1E13";
        text = "Not Running";
    }
    else if (refreshIntervalId._idleTimeout == -1){
        color = "#BD1E13";
        text = "Not Running";
    }
    else if(refreshIntervalId._idleTimeout == 900000){
        color = "#0eaf03";
        text = "Running"; 
    }

    //send embed
    const help_embed = new Discord.MessageEmbed()
    .setColor(color)
    .addFields(
        {name:'Current Status', value: text}
    )
    channelid.send(help_embed);
}




// discord start
client.on('ready', () => {
    console.log("start BOT");
});

client.on("message", msg => {

    // channel id
    const bot_channel_id = msg.channel.id; 

    if (msg.content === "!Status" || msg.content === "!status"){
        Status(bot_channel_id);
        console.log("status right");
    }

    //help bot
    if (msg.content === "!Help" || msg.content === "!help"){
        Help_for(bot_channel_id);
        console.log("lefut a help");
    }

    //start 30 last bot
    if (msg.content === "!start" || msg.content === "!Start" && refreshIntervalId._idleTimeout == -1){
        MSG_Channel_ = bot_channel_id;
        console.log("search loop elindult");      
        loop_request();
        refreshIntervalId = setInterval(function() {loop_request();}, 900000); //15 minut, 900 secound 
    }
    else{console.log("Már fut");}
    //stop 30 last bot
    if (msg.content === "!Stop" || msg.content === "!stop"){
        console.log("STOP Requesting");
        beginvar = true;
        clearInterval(refreshIntervalId);
        Help_for(bot_channel_id);
    }

    //searc cve name
    if (msg.content.startsWith("!search") == true || msg.content.startsWith("!Search") == true){
        MSG_Channel_ = bot_channel_id;
        const myArr = msg.content.split(" ");
        if (myArr.length >= 2){
            send_embed_search(myArr[1]);
        }
        else{
            console.log("message WRONG!");
        }
    }
});

client.login(''); // your token here...