// ==UserScript==
// @name         SteamMonsterGame-UpgradeHighlighter
// @namespace    https://github.com/borgsten/SteamMonsterGame-UpgradeHighlighter
// @version      1.0
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

    var printQuota  = false;




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
                {"Delta":10000,"Group":2}];

    var bestArmor, bestDPS, bestDMG;

    function s() {
        return g_Minigame.m_CurrentScene;
    };
    // Game started function
    function gameRunning() {
        try {
            var ready = document.querySelector("div.container_upgrades").children.length;
            return (typeof g_Minigame === "object" && g_Minigame.m_CurrentScene.m_rgGameData.status == 2 && ready != 0);
        }
        catch (e) {
            return false;
        }
    }

    function MainLoop(){

        updateQuotas();

        var buttons = document.querySelector("div.container_upgrades").getElementsByClassName("link");

        for(i=0;i<buttons.length;i++){
            buttons[i].addEventListener("click", updateQuotas);   
        }

    };
    function updateQuotas(){
        bestArmor = [Infinity,-1];
        bestDPS = [Infinity,-1];
        bestDMG = [Infinity,-1];

        updateList();
        var div_container = document.querySelector("div.container_upgrades").children;

        for(i=0;i<div_container.length;i++){
            var id = parseId(div_container[i].getAttribute('id'));
            var elem = div_container[i].getElementsByClassName("upgrade_text")[0];
            if(printQuota)
                elem.innerHTML=prop[id].PricePerUnit.toExponential(5);
            if(bestArmor[1] == id || bestDPS[1] == id || bestDMG[1] == id)
                elem.style.color = cheapest;
            else
                elem.style.color = expensive;
        }
    };

    function parseId(id){
        return id.replace(/\D/g,'');
    };


    function updateList(){
        var upgrades = g_Minigame.m_CurrentScene.m_rgPlayerUpgrades;
        for(i = 0; i<prop.length;i++){
            if(prop[i].Group == null)
                continue;
            prop[i].PricePerUnit=(upgrades[i].cost_for_next_level)/prop[i].Delta;   

            switch(prop[i].Group){
                case 0:
                    if(prop[i].PricePerUnit < bestArmor[0]){
                        bestArmor[0] = prop[i].PricePerUnit;
                        bestArmor[1] = i;
                    }
                    break;
                case 1:
                    if(prop[i].PricePerUnit < bestDPS[0]){
                        bestDPS[0] = prop[i].PricePerUnit;
                        bestDPS[1] = i;
                    }
                    break;
                case 2:
                    if(prop[i].PricePerUnit < bestDMG[0]){
                        bestDMG[0] = prop[i].PricePerUnit;
                        bestDMG[1] = i;
                    }
                    break;
            };
        };
    };

    var startAll = setInterval(function() { 
        if(!gameRunning())
            return;

        clearInterval(startAll);				
        MainLoop();
    }, 1000);



}(window));