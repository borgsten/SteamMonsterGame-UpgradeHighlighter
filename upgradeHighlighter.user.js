// ==UserScript==
// @name         SteamMonsterGame-UpgradeHighlighter
// @namespace    https://github.com/borgsten/SteamMonsterGame-UpgradeHighlighter
// @version      1.1
// @description  Calculates which upgrade is the most cost effective and highlights it
// @grant none
// @match        http://steamcommunity.com/minigame/towerattack/
// @updateURL    https://raw.githubusercontent.com/borgsten/SteamMonsterGame-UpgradeHighlighter/master/upgradeHighlighter.user.js
// @downloadURL  https://raw.githubusercontent.com/borgsten/SteamMonsterGame-UpgradeHighlighter/master/upgradeHighlighter.user.js
// ==/UserScript==


(function(w) {
    "use strict";

    var cheapest    = "#00d000"; //Green
    var expensive   = "#ff0000"; //Red

    var debug  = false;
    var clientSide  = true;


    var prop = [{"Delta":1300,"Group":0},
                {"Delta":10,"Group":1},
                {"Delta":10,"Group":2},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":10000,"Group":0},
                {"Delta":100,"Group":1},
                {"Delta":100,"Group":2},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":null,"Group":null},
                {"Delta":100000,"Group":0},
                {"Delta":1000,"Group":1},
                {"Delta":1000,"Group":2},
                {"Delta":1000000,"Group":0},
                {"Delta":10000,"Group":1},
                {"Delta":10000,"Group":2},
                {"Delta":10000000,"Group":0},
                {"Delta":100000,"Group":1},
                {"Delta":100000,"Group":2}];

    var bestArmor, bestDPS, bestDMG;

    // Game started function
    function gameReady() {
        try {
            var ready = document.querySelector("div.container_upgrades").children.length;
            return (typeof g_Minigame === "object" && g_Minigame.m_CurrentScene.m_rgGameData.status == 2 && ready != 0);
        }
        catch (e) {
            return false;
        }
    }

    function MainLoop(){

        if(clientSide){
            getOptimalUpgrade();

            var buttons = document.querySelector("div.container_upgrades").getElementsByClassName("link");

            for(i=0;i<buttons.length;i++){
                buttons[i].addEventListener("click", getOptimalUpgrade);   
            }
        }
        else
            setInterval(function(){getOptimalUpgrade();},1000);
    };
    
    function getOptimalUpgrade(){
        bestArmor = [Infinity,-1];
        bestDPS = [Infinity,-1];
        bestDMG = [Infinity,-1];

        if(clientSide)
            updateListClientSide();
        else
            updateListServerSide();

        var div_container = document.querySelector("div.container_upgrades").children;

        for(i=0;i<div_container.length;i++){
            
            var id = parseInt(div_container[i].getAttribute('id'));
            var elem = div_container[i].getElementsByClassName("upgrade_text")[0];
            
            if(debug && prop[id].PricePerUnit != undefined)
                elem.innerHTML=prop[id].PricePerUnit.toExponential(5);
            
            if(bestArmor[1] == id || bestDPS[1] == id || bestDMG[1] == id)
                elem.style.color = cheapest;
            else
                elem.style.color = expensive;
        }
    };

    function parseInt(s){
        return s.replace(/\D/g,'');
    };

    function parsePrefix(s){
        var prefix = {"" : 1, "K" : 1000, "M" : 1000000, "B" : 1000000000, "T" : 1000000000000};
        return prefix[s.replace(/[\W\d]+/g,'')];        
    };

    function updateListClientSide(){
        var div_container = document.querySelector("div.container_upgrades").children;


        for(i=0;i<div_container.length;i++){
            var id = parseInt(div_container[i].getAttribute('id'));
            var string = div_container[i].querySelector("div.cost").innerHTML;
            var cost = parseInt(string)*parsePrefix(string);

            if(prop[id].Group == null)
                continue;

            prop[id].PricePerUnit=cost/prop[id].Delta;

            updateBest(id);
        }
    };
    
    function updateListServerSide(){
        var upgrades = g_Minigame.m_CurrentScene.m_rgPlayerUpgrades;
        console.log(upgrades);
        for(i = 0; i<upgrades.length;i++){
            var id = upgrades[i].upgrade;

            if(prop[id].Group == null)
                continue;

            prop[id].PricePerUnit=upgrades[i].cost_for_next_level/prop[id].Delta;

            updateBest(id);
        };
    };
    
    function updateBest(id){
        switch(prop[id].Group){
            case 0:
                if(prop[id].PricePerUnit < bestArmor[0]){
                    bestArmor[0] = prop[id].PricePerUnit;
                    bestArmor[1] = id;
                }
                break;
            case 1:
                if(prop[id].PricePerUnit < bestDPS[0]){
                    bestDPS[0] = prop[id].PricePerUnit;
                    bestDPS[1] = id;
                }
                break;
            case 2:
                if(prop[id].PricePerUnit < bestDMG[0]){
                    bestDMG[0] = prop[id].PricePerUnit;
                    bestDMG[1] = id;
                }
                break;
        };
    };
    
    var start = setInterval(function() { 
        if(!gameReady())
            return;

        clearInterval(start);               
        MainLoop();
    }, 1000);

}(window));