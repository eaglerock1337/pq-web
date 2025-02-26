// Copyright (c)2002-2010 Eric Fredricksen <e@fredricksen.net> all rights reserved

var game = {};
var clock;

function timeGetTime() {
  return new Date().getTime();
}

function StartTimer() {
  if (!clock) {
    clock = new Worker('clock.js');
    clock.addEventListener('message', e => {
      Timer1Timer();
      clock.lasttick = timeGetTime();
    });
  }
  if (!clock.running) {
    clock.lasttick = timeGetTime();
    clock.running = true;
    clock.postMessage('start');
  }
}

function StopTimer() {
  if (clock) {
    clock.postMessage('stop');
    clock.running = false;
  }
}

function Q(s) {
  game.queue.push(s);
  Dequeue();
}

function TaskDone() {
  return TaskBar.done();
}

function Odds(chance, outof) {
  return Random(outof) < chance;
}

function RandSign() {
  return Random(2) * 2 - 1;
}

function RandomHigh(ceiling) {
  return Max(weightedRandom(ceiling,0.8), weightedRandom(ceiling,0.8));
}

function RandomLow(below) {
  return Min(Random(below), Random(below));
}

function PickLow(s) {
  return s[RandomLow(s.length)];
}

function PickHigh(s) {
  return s[RandomHigh(s.length)];
}

function Copy(s, b, l) {
  return s.substr(b-1, l);
}

function Length(s) {
  return s.length;
}

function Starts(s, pre) {
  return 0 === s.indexOf(pre);
}

function Ends(s, e) {
  return Copy(s, 1+Length(s)-Length(e), Length(e)) == e;
}

function Plural(s) {
  const words = s.trim().split(/\s+/);
  if (words.length === 1) {
    return pluralizeWord(words[0]);
  } else {
    let result = [...words];
    result[result.length - 1] = pluralizeWord(result[result.length - 1]);
    return result.join(' ');
  }
}

function pluralizeWord(word) {
  const lowerWord = word.toLowerCase();
  if (word === 'foot') return 'feet';
  if (['kvarter', 'perch', 'steppes'].includes(lowerWord)) return word;
  if (word === 'wood') {
    return Math.random() < 0.5 ? 'wood' : 'woods';
  }
  if (Ends(word, 'y')) {
    if (lowerWord === 'valley') return word + 's';
    return Copy(word, 1, Length(word) - 1) + 'ies';
  } else if (Ends(word, 'us')) {
    return Copy(word, 1, Length(word) - 2) + 'i';
  } else if (Ends(word, 'ch') || Ends(word, 'x') || Ends(word, 's') || Ends(word, 'sh')) {
    return word + 'es';
  } else if (Ends(word, 'f') && !['cliff', 'chief', 'reef'].includes(lowerWord)) {
    if (['knife', 'leaf', 'thief', 'loaf'].includes(lowerWord)) {
      return Copy(word, 1, Length(word) - 1) + 'ves';
    }
    if (lowerWord === 'dwarf') {
      return Random(2) ? word + 's' : Copy(word, 1, Length(word) - 1) + 'ves';
    }
    return Copy(word, 1, Length(word) - 1) + 'ves';
  } else if (Ends(word, 'man') || Ends(word, 'Man')) {
    return Copy(word, 1, Length(word) - 2) + 'en';
  } else {
    return word + 's';
  }
}

function Split(s, field, separator) {
  return s.split(separator || "|")[field];
}

function Indefinite(s, qty) {
  if (qty == 1) {
    if (Pos(s.charAt(0), 'AEIOUÜaeiouü') > 0)
      return 'an ' + s;
    else
      return 'a ' + s;
  } else {
    return IntToStr(qty) + ' ' + Plural(s);
  }
}

function Definite(s, qty) {
  if (qty > 1)
    s = Plural(s);
  return 'the ' + s;
}

function prefix(a, m, s, sep) {
  if (sep == undefined) sep = ' ';
  m = Abs(m);
  if (m < 1 || m > a.length) return s;  // In case of screwups
  return a[m-1] + sep + s;
}

function Sick(m, s) {
  m = 6 - Abs(m);
  return prefix(['dead','comatose','crippled','sick','undernourished'], m, s);
}


function Young(m, s) {
  m = 6 - Abs(m);
  return prefix(['foetal','baby','preadolescent','teenage','underage'], m, s);
}


function Big(m, s) {
  return prefix(['greater','massive','enormous','giant','titanic'], m, s);
}

function Special(m, s) {
  if (Pos(' ', s) > 0)
    return prefix(['veteran','cursed','warrior','undead','demon'], m, s);
  else
    return prefix(['Battle-','cursed ','Were-','undead ','demon '], m, s, '');
}

function InterplotCinematic() {
  switch (Random(3)) {
  case 0:
    Q('task|1|Exhausted, you arrive at a friendly oasis in a hostile land');
    Q('task|2|You greet old friends and meet new allies');
    Q('task|2|You are privy to a council of powerful do-gooders');
    Q('task|1|There is much to be done. You are chosen!');
    break;
  case 1:
    Q('task|1|Your quarry is in sight, but a mighty enemy bars your path!');
    var nemesis = NamedMonster(GetI(Traits,'Level')+3);
    Q('task|4|A desperate struggle commences with ' + nemesis);
    var s = Random(3);
    for (var i = 1; i <= Random(1 + game.act + 1); ++i) {
      s += 1 + Random(2);
      switch (s % 3) {
      case 0: Q('task|2|Locked in grim combat with ' + nemesis); break;
      case 1: Q('task|2|' + nemesis + ' seems to have the upper hand'); break;
      case 2: Q('task|2|You seem to gain the advantage over ' + nemesis); break;
      }
    }
    Q('task|3|Victory! ' + nemesis + ' is slain! Exhausted, you lose consciousness');
    Q('task|2|You awake in a friendly place, but the road awaits');
    break;
  case 2:
    var nemesis2 = ImpressiveGuy();
    Q("task|2|Oh sweet relief! You've reached the kind protection of " + nemesis2);
    Q('task|3|There is rejoicing, and an unnerving encounter with ' + nemesis2 + ' in private');
    Q('task|2|You forget your ' + BoringItem() + ' and go back to get it');
    Q("task|2|What's this!? You overhear something shocking!");
    Q('task|2|Could ' + nemesis2 + ' be a dirty double-dealer?');
    Q('task|3|Who can possibly be trusted with this news!? -- Oh yes, of course');
    break;
  }
  Q('plot|1|Loading');
}

//-fun for the console output...
function sideQuestStorySample() {
	let sideQuestNPC = coolName();
	let sideQuestItm = (Random(2) === 0 ? Indefinite(InterestingItem(),(Random(42)+1)) : Definite(InterestingItem(),(Random(2)+1))) + " of " + Pick(K.ItemOfs)
	let sideQuestDest = Pick([' at ',' near ',' around ',]) + Definite(GenerateItemPrefix() + " " + ProperCase(Pick(K.fuzzyLocations)),(Random(2)+1)) + " of " + 
		GenerateLocationName(Pick([1,2,3]), Pick(['mixed','elvish','dwarvish','human','dark']));
	return 'You are approached by ' + sideQuestNPC + ', who tells you of a great treasure' + sideQuestDest +
	'.  "You seek the ' + sideQuestItm + '".  You agree and set out on your journey...  ' +
	'You reach your destination and find...  ...nothing.  You begin to make your way back home.  You quicky find ' + splitName(sideQuestNPC) + 
	' who apologizes for wasting your time.  Not before you rattle some gold out of them!';
}

function doSideQuest() {
  const sideQuest = generateSideQuest();
  game.sideQuest = sideQuest; //testing
  game.sideQuestSteps = sideQuest.steps.map((step, index) => () => Task(step, 5000 + index * 1000));
  game.task = "sideQuest";
  
  // Use the already substituted outcome
  game.sideQuestOutcome = sideQuest.outcome;
  game.sideQuestItem = sideQuest.rawData.item || "unknown item"; // Use the generated item directly

  const caption = `Side Quest: ${sideQuest.name}`;
  game.Quests.push(caption);
  game.bestquest = caption;
  Quests.AddUI(caption);
  Log('Commencing quest: ' + caption);
}

//---------
//---------New Side Quest system
function generateSideQuest() {
  const template = Pick(sideQuestTemplates);
  const npc = coolName();
  const npc2 = GenerateNameNew(1,Pick(['elvish','dwarvish','dark']));
  const item = coolItem();
  const gold = addScaledGold();
  const location = coolPlace();
  const location2 = coolPlace();
  const town = GenerateLocationName(1, Pick(['elvish','dwarvish','human']),false);
  const mountDoom = GenerateLocationName(Pick([1,2]), 'dark',false);
  const monster = NamedMonster();
  const target = coolName();
  const rawOutcome = Pick(template.outcomes);

  // Substitute placeholders in the outcome upfront
  const outcome = rawOutcome
    .replace("$NPCTOO", npc2)
    .replace("$NPC", npc)
    .replace("$ITEM", item)
    .replace("$LOCATIONTOO", location2)
    .replace("$LOCATION", location)
    .replace("$TOWN", town)
    .replace("$MOUNT_DOOM", mountDoom)
    .replace("$MONSTER", monster)
    .replace("$TARGET", target);

  const steps = template.steps.map(step =>
	step.replace("$NPCTOO", npc2)
		.replace("$NPC", npc)
        .replace("$ITEM", item)
		.replace("$LOCATIONTOO", location2)
        .replace("$LOCATION", location)
		.replace("$TOWN", town)
		.replace("$MOUNT_DOOM", mountDoom)
        .replace("$MONSTER", monster)
        .replace("$TARGET", target)
        .replace("$OUTCOME", outcome) // Use the substituted outcome
  );

  const questName = template.nameTemplate
    .replace("$NPCTOO", splitName(npc2))
    .replace("$NPC", splitName(npc))
    .replace("$ITEM", item)
    .replace("$LOCATIONTOO", location2)
    .replace("$LOCATION", location)
    .replace("$TOWN", town)
    .replace("$MOUNT_DOOM", mountDoom)
    .replace("$MONSTER", monster)
    .replace("$TARGET", splitName(target));

  return { 
    name: questName, 
    steps, 
    outcome, 
    rawData: { npc, npc2, item, location, location2, town, mountDoom, monster, target, outcome: rawOutcome } // Store raw outcome for reference
  };
}
//---------


function StrToInt(s) {
  return parseInt(s, 10);
}

function IntToStr(i) {
  return i + "";
}

function NamedMonster(level) {
  var lev = 0;
  var result = '';
  for (var i = 0; i < 5; ++i) {
    var m = Pick(K.Monsters);
    if (!result || (Abs(level-StrToInt(Split(m,1))) < Abs(level-lev))) {
      result = Split(m,0);
      lev = StrToInt(Split(m,1));
    }
  }
  return GenerateName() + ' the ' + result;
}

function ImpressiveGuy() {
  if (Random(2)) {
    return 'the ' + Pick(K.ImpressiveTitles) + ' of the ' + Plural(Split(Pick(K.Races), 0));
  } else {
    return Pick(K.ImpressiveTitles) + ' ' + GenerateName() + ' of ' + GenerateName();
  }
}

function MonsterTask(level) {
  var definite = false;
  for (var i = level; i >= 1; --i) {
    if (Odds(2,5))
      level += RandSign();
  }
  if (level < 1) level = 1;
  // level = level of puissance of opponent(s) we'll return

  var monster, lev;
  if (Odds(1,25)) {
    // Use an NPC every once in a while
      monster = ' ' + Split(Pick(K.Races), 0);
    if (Odds(1,2)) {
      monster = 'passing' + monster + ' ' + Split(Pick(K.Klasses), 0);
    } else {
      monster = PickLow(K.Titles) + ' ' + GenerateName() + ' the' + monster;
      definite = true;
    }
    lev = level;
    monster = monster + '|' + IntToStr(level) + '|*';
  } else if (game.questmonster && Odds(1,4)) {
    // Use the quest monster
    monster = K.Monsters[game.questmonsterindex];
    lev = StrToInt(Split(monster,1));
  } else {
    // Pick the monster out of so many random ones closest to the level we want
    monster = Pick(K.Monsters);
    lev = StrToInt(Split(monster,1));
    for (var ii = 0; ii < 5; ++ii) {
      var m1 = Pick(K.Monsters);
      if (Abs(level-StrToInt(Split(m1,1))) < Abs(level-lev)) {
        monster = m1;
        lev = StrToInt(Split(monster,1));
      }
    }
  }

  var result = Split(monster,0);
  game.task = 'kill|' + monster;
  
  var qty = 1;
  if (level-lev > 10) {
    // lev is too low. multiply...
    qty = Math.floor((level + Random(Max(lev,1))) / Max(lev,1));
    if (qty < 1) qty = 1;
    level = Math.floor(level / qty);
  }

  if ((level - lev) <= -10) {
    result = 'imaginary ' + result;
  } else if ((level-lev) < -5) {
    i = 10+(level-lev);
    i = 5-Random(i+1);
    result = Sick(i,Young((lev-level)-i,result));
  } else if (((level-lev) < 0) && (Random(2) == 1)) {
    result = Sick(level-lev,result);
  } else if (((level-lev) < 0)) {
    result = Young(level-lev,result);
  } else if ((level-lev) >= 10) {
    result = 'messianic ' + result;
  } else if ((level-lev) > 5) {
    i = 10-(level-lev);
    i = 5-Random(i+1);
    result = Big(i,Special((level-lev)-i,result));
  } else if (((level-lev) > 0) && (Random(2) == 1)) {
    result = Big(level-lev,result);
  } else if (((level-lev) > 0)) {
    result = Special(level-lev,result);
  }

  lev = level;
  level = lev * qty;

  if (!definite) result = Indefinite(result, qty);
  return { 'description': result, 'level': level };
}

function LowerCase(s) {
  return s.toLowerCase();
}

function ProperCase(s) {
  return Copy(s,1,1).toUpperCase() + Copy(s,2,10000);
}

function calcScaledGold() {
  let currentGold = GetI(Inventory, 'Gold');
  let additionalGold;

  if (currentGold <= 100) {
    additionalGold = 100;
  } else {
	additionalGold = Math.floor(100 * Math.pow(1.05, currentGold / 100));
  }

  return additionalGold;
}

function addScaledGold(subtractGold = false) {
  let currentGold = GetI(Inventory, 'Gold');
  let difference = calcScaledGold()
  if (currentGold - difference <= 0 && subtractGold) {
	Add(Inventory, 'Gold', - currentGold);
  } else if (currentGold - difference >= 0 && subtractGold) {
    Add(Inventory, 'Gold', - difference);
  } else {
    Add(Inventory, 'Gold', difference);
  }
}

function EquipPrice() {
  return  5 * GetI(Traits,'Level') * GetI(Traits,'Level') +
    10 * GetI(Traits,'Level') +
    20;
}

function Dequeue() {
  while (TaskDone()) {
    var old = game.task;
	generateHash(game).then(hash => { updateMandelbulb(hash) });
    if (game.task === 'sideQuest') {
      if (game.sideQuestSteps && game.sideQuestSteps.length > 0) {
        const nextStep = game.sideQuestSteps.shift();
        nextStep();
        break;
      } else {
        game.task = '';
        delete game.sideQuestSteps;

        // Use the fully substituted outcome
        if (game.sideQuestOutcome.includes("claim the") || game.sideQuestOutcome.includes("claim its trophy") || 
			game.sideQuestOutcome.includes("hidden treasure!")) {
          ExpBar.increment(100);
		  Task("You gained a " + game.sideQuestItem + "!", 2000);
          Add(Inventory, game.sideQuestItem, 1);
        } else if (game.sideQuestOutcome.includes("attacks") || game.sideQuestOutcome.includes("overpowers you") || 
			game.sideQuestOutcome.includes("overwhelms you") || game.sideQuestOutcome.includes("too dangerous") ||
			game.sideQuestOutcome.includes("retreat") || game.sideQuestOutcome.includes("You are defeated")){
          Task("You fought bravely but gained only experience.", 2000);
          ExpBar.increment(100);
        } else if (game.sideQuestOutcome.includes("dangerous confrontation")) {
		  Task("You managed to dispatch the beast and uncover " + game.sideQuestItem + "!", 2000);
		  Add(Inventory, game.sideQuestItem, 1);
          ExpBar.increment(100);
		} else if (game.sideQuestOutcome.includes("return as a hero")) {
          Task("The townsfolk cheer your name!", 2000);
          ExpBar.increment(100);
        } else if (game.sideQuestOutcome.includes("pays hansomly")) {
          Task("Take it!  I don't need it!", 2000);
		  addScaledGold();
		  addScaledGold();
          ExpBar.increment(100);
        } else if (game.sideQuestOutcome.includes("triggers a trap")) { 
		  Task("You have obtained a " + game.sideQuestItem + " and a bag of gold!", 2000);
          Add(Inventory, game.sideQuestItem, 1);
		  addScaledGold();
          ExpBar.increment(100);
        } else if (game.sideQuestOutcome.includes("It is destroyed forever!") || game.sideQuestOutcome.includes("falls into the fires accidentally!")) { 
		  Task("You retire, comforted that the evil has been driven from the land!  ...for now", 2000);
          ExpBar.increment(1500);
	    } else if (game.sideQuestOutcome.includes("steals the ring")) { 
		  Task("Oh no!  What will be come of the world?", 2000);
          ExpBar.increment(150);
	    } else if (game.sideQuestOutcome.includes("the culprit was")) { 
		  Task("You return to town and find that they have fled.", 2000);
          ExpBar.increment(100);
	    } else {
          Task("Better luck next time.", 2000);
          ExpBar.increment(50);
        }

        QuestBar.reposition(QuestBar.Max());
        Log('Quest completed: ' + game.bestquest);
        Quests.CheckAll();
        break;
      }
    } else if (Split(game.task, 0) === 'kill') {
      if (Split(game.task, 3) === '*') {
        WinItem();
      } else if (Split(game.task, 3)) {
        if (Split(game.task, 3).indexOf(',') > -1) {
          var mItem = Pick(Split(game.task, 3).split(','));
          if (mItem === '*') {
            WinItem();
          } else {
            Add(Inventory, LowerCase(Split(game.task, 1) + ' ' + ProperCase(mItem)), 1);
          }
        } else {
          Add(Inventory, LowerCase(Split(game.task, 1) + ' ' + ProperCase(Split(game.task, 3))), 1);
        }
      }
    } else if (game.task === 'buying') {
      Add(Inventory, 'Gold', -EquipPrice());
      WinEquip();
    } else if (game.task === 'market' || game.task === 'sell') {
      if (game.task === 'sell') {
        var amt = GetI(Inventory, 1) * GetI(Traits, 'Level');
        if (Pos(' of ', Inventory.label(1)) > 0) {
          amt *= (1 + RandomLow(10)) * (1 + RandomLow(GetI(Traits, 'Level')));
        }
        Inventory.remove1();
        Add(Inventory, 'Gold', amt);
      }
      if (Inventory.length() > 1) {
        Inventory.scrollToTop();
        Task('Selling ' + Indefinite(Inventory.label(1), GetI(Inventory, 1)), 1 * 1000);
        game.task = 'sell';
        break; // Exit loop after setting sell task
      }
    }

    if (!game.task.startsWith('sideQuest')) {
      game.task = '';
    }

    if (game.queue.length > 0) {
      var a = Split(game.queue[0], 0);
      var n = StrToInt(Split(game.queue[0], 1));
      var s = Split(game.queue[0], 2);
      if (a === 'task' || a === 'plot') {
        game.queue.shift();
        if (a === 'plot') {
          CompleteAct();
          s = 'Loading ' + game.bestplot;
        }
        Task(s, n * 1000);
        break; // Exit loop after queuing a new task
      } else {
        throw 'Unknown queue action: ' + a;
      }
    } else if (EncumBar.done()) {
      Task('Heading to market to sell loot', 4 * 1000);
      game.task = 'market';
      break; // Exit loop after setting market task
    } else if (!game.task && Pos('kill|', old) <= 0 && old !== 'heading') {
      if (GetI(Inventory, 'Gold') > EquipPrice()) {
        Task('Negotiating purchase of better equipment', 5 * 1000);
        game.task = 'buying';
        break; // Exit loop after setting buying task
      } else {
        Task('Heading to the killing fields', 4 * 1000);
        game.task = 'heading';
        break; // Exit loop after setting heading task
      }
    } else if (!game.task) {
      var nn = GetI(Traits, 'Level');
      var t = MonsterTask(nn);
      var InventoryLabelAlsoGameStyleTag = 3;
      nn = Math.floor((2 * InventoryLabelAlsoGameStyleTag * t.level * 1000) / nn);
      Task('Executing ' + t.description, nn);
      break; // Exit loop after setting monster task
    }
  }
}


function Put(list, key, value) {
  if (typeof key === typeof 1)
    key = list.label(key);

  if (list.fixedkeys) {
    game[list.id][key] = value;
  } else {
    var i = 0;
    for (; i < game[list.id].length; ++i) {
      if (game[list.id][i][0] === key) {
        game[list.id][i][1] = value;
        break;
      }
    }
    if (i == game[list.id].length)
      game[list.id].push([key,value]);
  }

  list.PutUI(key, value);

  if (key === 'STR')
    EncumBar.reset(10 + value, EncumBar.Position());

  if (list === Inventory) {
    var cubits = 0;
    $.each(game.Inventory.slice(1), function (index, item) {
      cubits += StrToInt(item[1]);
    });
    EncumBar.reposition(cubits);
  }
}


function ProgressBar(id, tmpl) {
  this.id = id;
  this.bar = $("#"+ id + " > .bar");
  this.tmpl = tmpl;

  this.Max = function () { return game[this.id].max; };
  this.Position = function () { return game[this.id].position; };

  this.reset = function (newmax, newposition) {
    game[this.id].max = newmax;
    this.reposition(newposition || 0);
  };

  this.reposition = function (newpos) {
    game[this.id].position = Min(newpos, this.Max());

    // Recompute hint
    game[this.id].percent = (100 * this.Position()).div(this.Max());
    game[this.id].remaining = Math.floor(this.Max() - this.Position());
    game[this.id].time = RoughTime(this.Max() - this.Position());
    game[this.id].hint = template(this.tmpl, game[this.id]);

    // Update UI
    if (this.bar) {
      var p = this.Max() ? 100 * this.Position() / this.Max() : 0;
      this.bar.css("width", p + "%");
      this.bar.parent().find(".hint").text(game[this.id].hint);
    }
  };

  this.increment = function (inc) {
    this.reposition(this.Position() + inc);
  };

  this.done = function () {
    return this.Position() >= this.Max();
  };

  this.load = function (game) {
    this.reposition(this.Position());
  };
}



function Key(tr) {
  return $(tr).children().first().text();
}

function Value(tr) {
  return $(tr).children().last().text();
}


function ListBox(id, columns, fixedkeys) {
  this.id = id;
  this.box = $("tbody#_, #_ tbody".replace(/_/g, id));
  this.columns = columns;
  this.fixedkeys = fixedkeys;

  this.AddUI = function (caption) {
    if (!this.box) return;
    var tr = $("<tr><td><input type=checkbox disabled> " +
               caption + "</td></tr>");
    tr.appendTo(this.box);
    tr.each(function () {this.scrollIntoView();});
    return tr;
  };

  this.ClearSelection = function () {
    if (this.box)
      this.box.find("tr").removeClass("selected");
  };

  this.PutUI = function (key, value) {
    if (!this.box) return;
    var item = this.rows().filter(function (index) {
      return Key(this) === key;
    });
    if (!item.length) {
      item = $("<tr><td>" + key + "</td><td/></tr>");
      this.box.append(item);
    }

    item.children().last().text(value);
    item.addClass("selected");
    item.each(function () {this.scrollIntoView();});
  };

  this.scrollToTop = function () {
    if (this.box)
      this.box.parents(".scroll").scrollTop(0);
  };

  this.rows = function () {
    return this.box.find("tr").has("td");
  };

  this.CheckAll = function (butlast) {
    if (this.box) {
      if (butlast)
        this.rows().find("input:checkbox").not(':last').attr("checked","true");
      else
        this.rows().find("input:checkbox").attr("checked","true");
    }
   };

  this.length = function () {
    return (this.fixedkeys || game[this.id]).length;
  };

  this.remove0 = function (n) {
    if (game[this.id])
      game[this.id].shift();
    if (this.box)
      this.box.find("tr").first().remove();
  };

  this.remove1 = function (n) {
    var t = game[this.id].shift();
    game[this.id].shift();
    game[this.id].unshift(t);
    if (this.box)
      this.box.find("tr").eq(1).remove();
  };


  this.load = function (game) {
    var that = this;
    var dict = game[this.id];
    if (this.fixedkeys) {
      $.each(this.fixedkeys, function (index, key) {
        that.PutUI(key, dict[key]);
      });
    } else {
      $.each(dict, function (index, row) {
        if (that.columns == 2)
          that.PutUI(row[0], row[1]);
        else
          that.AddUI(row);
      });
    }
  };


  this.label = function (n) {
    return this.fixedkeys ? this.fixedkeys[n] : game[this.id][n][0];
  };
}


var ExpBar, PlotBar, TaskBar, QuestBar, EncumBar;
var Traits,Stats,Spells,Equips,Inventory,Plots,Quests;
var Kill;
var AllBars, AllLists;


function StrToIntDef(s, def) {
  var result = parseInt(s, 10);
  return isNaN(result) ? def : result;
}


if (document)
  $(document).ready(FormCreate);


function WinSpell() {
  AddR(Spells, K.Spells[RandomLow(Min(GetI(Stats,'WIS')+GetI(Traits,'Level'),
                                      K.Spells.length))], 1);
}

function LPick(list, goal) {
  var result = Pick(list);
  for (var i = 1; i <= 5; ++i) {
    var best = StrToInt(Split(result, 1));
    var s = Pick(list);
    var b1 = StrToInt(Split(s,1));
    if (Abs(goal-best) > Abs(goal-b1))
      result = s;
  }
  return result;
}

function Abs(x) {
  if (x < 0) return -x; else return x;
}

function WinEquip() {
  var posn = Random(Equips.length());

  if (!posn) {
    stuff = K.Weapons;
    better = K.OffenseAttrib;
    worse = K.OffenseBad;
  } else {
    better = K.DefenseAttrib;
    worse = K.DefenseBad;
    stuff = (posn == 1) ? K.Shields:  K.Armors;
  }
  var name = LPick(stuff, GetI(Traits,'Level'));
  var qual = StrToInt(Split(name,1));
  name = Split(name,0);
  var plus = GetI(Traits,'Level') - qual;
  if (plus < 0) better = worse;
  var count = 0;
  while (count < 2 && plus) {
    var modifier = Pick(better);
    qual = StrToInt(Split(modifier, 1));
    modifier = Split(modifier, 0);
    if (Pos(modifier, name) > 0) break; // no repeats
    if (Abs(plus) < Abs(qual)) break; // too much
    name = modifier + ' ' + name;
    plus -= qual;
    ++count;
  }
  if (plus) name = plus + ' ' + name;
  if (plus > 0) name = '+' + name;

  Put(Equips, posn, name);
  game.bestequip = name;
  if (posn > 1) game.bestequip += ' ' + Equips.label(posn);
}


function Square(x) { return x * x; }

function WinStat() {
  var i;
  if (Odds(1,2))  {
    i = Pick(K.Stats);
  } else {
    // Favor the best stat so it will tend to clump
    var t = 0;
    $.each(K.PrimeStats, function (index, key) {
      t += Square(GetI(Stats, key));
    });
    t = Random(t);
    $.each(K.PrimeStats, function (index, key) {
      i = key;
      t -= Square(GetI(Stats, key));
      if (t < 0) return false;
    });
  }
  Add(Stats, i, 1);
}

function GenerateItemPrefix(){
	return Random(2) === 0 ? Pick(K.ItemAttrib): 
		(Random(2) === 0 ? (Random(2) === 0 ? Split(Pick(K.OffenseAttrib),0) : Split(Pick(K.OffenseBad),0)) : 
		(Random(2) === 0 ? Split(Pick(K.DefenseAttrib),0) : Split(Pick(K.DefenseBad),0)));
}

function SpecialItem() {
  return InterestingItem() + ' of ' + Pick(K.ItemOfs);
}

function InterestingItem() {
  return Random(2) === 0 ? GenerateItemPrefix() + ' ' + Pick(K.Specials) : CuriousItem();
}

function CuriousItem() {
	let result, cItem;
	cItem =   Random(2) === 0 ? (Random(2) === 0 ? Split(Pick(K.Weapons),0) : Split(Pick(K.Shields),0)) : 
		(Random(2) === 0 ? Split(Pick(K.Armors),0) : ProperCase(BoringItem()));
	result = GenerateItemPrefix() + ' ' + cItem;
	return result;
}

function BoringItem() {
  return Pick(K.BoringItems);
}

function randomTask() {
    var result;
    var verb = Pick(K.Verbs);

    var itemType = Random(2) === 0 ? 'Definite' : 'Indefinite';
    var firstItem = Random(2) === 0 ? 'BoringItem' : 'InterestingItem';
    var secondItem = firstItem === 'InterestingItem' ? (Random(2) === 0 ? 'InterestingItem' : 'SpecialItem') : 'SpecialItem';

    var itemFunction = itemType === 'Definite' ? Definite : Indefinite;
    var firstItemFunction = firstItem === 'BoringItem' ? BoringItem : InterestingItem;
    var secondItemFunction = secondItem === 'InterestingItem' ? InterestingItem : SpecialItem;

    var quantity = itemType === 'Definite' ? Random(2) + 1 : Random(12) + 1;

    var target = Random(2) === 0 ? K.Races : K.Monsters;

    var preposition1 = Random(2) === 0 ? 'of' : 'from';
    var preposition2 = Random(2) === 0 ? 'of' : 'from';

    result = verb + ' ' + itemFunction(ProperCase(firstItemFunction()), quantity) + ' ' + preposition1 + ' the ' + secondItemFunction() + ' ' + 
		preposition2 + ' ' + Pick(K.ImpressiveTitles) + ' ' + GenerateNameNew(Pick([1,2]), Pick(['mixed','elvish','dwarvish','human'])) + ', ' +
		Pick(K.KlassTitles) + ' ' + Split(Pick(K.Klasses), 0) + ' of the ' + Plural(Split(Pick(target), 0)) + '.';

    return result;
}


function diplomaticMission() {
	let result = Pick(K.moreVerbs) + " and " + Pick(K.Verbs) + " " + Indefinite(GenerateItemPrefix(),1) + " " + Split(Pick(Random(2) === 0 ? K.Races : K.Monsters),0) + 
		(Random(2) === 0 ? " that has " : " who has ") + Pick(K.spellVerbs) + ' ' +
		(Random(2) === 0 ? Indefinite(Pick(K.Spells),(Random(42)+1)) : Definite(Pick(K.Spells),(Random(2)+1))) + " of " + Pick(K.ItemOfs) +
		(Random(2) === 0 ? "": Pick(K.spellTargets)) +
		Pick([' at ',' near ',' around ',]) + Definite(GenerateItemPrefix() + " " + ProperCase(Pick(K.fuzzyLocations)),(Random(2)+1)) + " of " + 
		GenerateLocationName(Pick([1,2,3]), Pick(['mixed','elvish','dwarvish','human','dark'])) + '.';
	return result;
}

function randomTaskToo() {
	return Pick(K.travelVerbs) + ' ' + coolPlace() + Pick(K.connectingPhrases) + Pick(K.moreVerbs) + ' ' + coolName() + 
		(Random(2) === 0 ? ".  Then " : " and ") + Pick(K.Verbs) + ' ' + coolItem() + '.';
}

function wallyBfeed(numSteps = 3) {
    // Generate the treasure and final monster upfront
    const treasure = generateLegendaryItemName(null, 'unique');
    const finalMonster = NamedMonster(GetI(Traits, 'Level') + 5);

    // Create an array of landmarks (numSteps intermediate + 1 final)
    const landmarks = [];
    for (let i = 0; i <= numSteps; i++) {
        landmarks.push(fuzzyPlace() + " of " + namedPlace());
    }

    const result = [];

    // First step: Initial journey
    let step = "First, you must " + 
               LowerCase(splitName(Pick(K.travelVerbs))) + " " + 
               Indefinite(PickHigh(K.travelUnitsOfMeasure), (Random(100) + 1)) + " " + 
               Pick(K.Directions) + " to " + 
               landmarks[0];
    result.push(step);

    // Intermediate steps: Travel with possible interactions    splitName(Pick(K.travelVerbs))
    for (let i = 1; i < numSteps; i++) {
        step = Pick(K.travelVerbsAlt) + ' ' +
               Indefinite(Pick(K.travelUnitsOfMeasure), (Random(100) + 1)) + " " + 
               Pick(K.Directions) + " to " + 
               landmarks[i];

        // 30% chance of an interaction
        if (Random(10) < 3) {
            const interactionType = Random(2);
            if (interactionType === 0) { // Visit
                const entity = coolName();
                const visitType = Random(2);
                if (visitType === 0) {
                    step += ", where you must " + LowerCase(Pick(K.moreVerbs)) + ' ' + entity;
                } else {
                    const item = coolItem();
                    step += ", where you must " + LowerCase(Pick(K.Verbs))+ ' ' + item + Pick(K.connectingPhrases) + LowerCase(Pick(K.moreVerbs)) + ' ' + entity;
                }
            } else { // Encounter
                const monster = NamedMonster(GetI(Traits, 'Level'));
                step += ", where you must defeat " + monster + " to proceed";
            }
        }
        result.push(step);
    }

    // Final step: Reach the destination, fight the monster, claim the treasure
    step = "Finally, you arrive at " + 
           landmarks[numSteps] + 
           ", where you must face " + finalMonster + 
           " and claim your prize: " + treasure;
    result.push(step);

    return result;
}

function WinItem() {
  if (Max(250, Random(999)) < Inventory.length()) {
    Add(Inventory, Pick(Inventory.rows()).firstChild.innerText, 1);
  } else {
    Add(Inventory, SpecialItem(), 1);
  }
}

function generateMonsterQuest(verb) {
  let level = GetI(Traits, 'Level');
  let lev = 0;
  for (let i = 0; i < 4; i++) {
    let montag = Random(K.Monsters.length);
    let m = K.Monsters[montag];
    let l = StrToInt(Split(m, 1));
    if (i === 0 || Math.abs(l - level) < Math.abs(lev - level)) {
      lev = l;
      game.questmonster = m;
      game.questmonsterindex = montag;
    }
  }
  return `${verb} ${Definite(Split(game.questmonster, 0), 2)}`;
}

function generateItemQuest(verb, itemFunc, qty = 1, definite = false) {
  let item = itemFunc();
  let article = definite ? Definite(item, qty) : Indefinite(item, qty);
  return `${verb} ${article}`;
}

function CompleteQuest() {
  QuestBar.reset(50 + Random(100));
  if (Quests.length()) {
    Log('Quest completed: ' + game.bestquest);
    Quests.CheckAll();
    [WinSpell, WinEquip, WinStat, WinItem][Random(4)]();
  }
  while (Quests.length > 99) Quests.remove0();

  game.questmonster = '';

  const questGenerators = [
    () => generateMonsterQuest('Exterminate'),
    () => generateItemQuest('Seek', () => InterestingItem(), 1, true),
    () => generateItemQuest('Deliver this', BoringItem),
    () => generateItemQuest('Fetch me', BoringItem, 1),
    () => { let caption = generateMonsterQuest('Placate'); game.questmonster = ''; return caption; },
    () => generateItemQuest('Restore', InterestingItem, 2, true),
    () => generateItemQuest('Repair these', BoringItem, 3),
    () => generateItemQuest('Upgrade', InterestingItem, 1, true),
    () => generateItemQuest('Decommision', InterestingItem, 1),
    () => generateItemQuest('Sign for delivery of', BoringItem, Random(42) + 1),
    () => generateItemQuest('Ship', BoringItem, Random(20) + 1) + " to the village of " + GenerateLocationName() + ".",
    () => "Recover the CEO's " + InterestingItem(),
    () => "Assist the Executive with " + Indefinite(InterestingItem(), Random(2) + 1),
    () => { let caption = generateMonsterQuest('Resolve tickets about'); game.questmonster = ''; return caption; },
    () => generateItemQuest('Implement a policy for', SpecialItem, 1, true),
    () => generateItemQuest('Find replacement parts for', SpecialItem, 1, true),
    () => generateItemQuest('Purchase', BoringItem, Random(100) + 1),
    () => Random(2) === 0 ? randomTask() : randomTaskToo(),
    () => diplomaticMission(),
    () => { doSideQuest(); } // No caption here, doSideQuest handles it
  ];

  const caption = questGenerators[Random(questGenerators.length)]();
  if (!game.Quests) game.Quests = [];
  while (game.Quests.length > 99) game.Quests.shift();

  // Only add caption if it exists (side quests handle their own)
  if (caption) {
    game.Quests.push(caption);
    game.bestquest = caption;
    Quests.AddUI(caption);
    Log('Commencing quest: ' + caption);
  }

  SaveGame();
}


function CompleteAct() {
  Plots.CheckAll();
  game.act += 1;
  PlotBar.reset(60 * 60 * (1 + 5 * game.act)); // 1 hr + 5/act
  Plots.AddUI((game.bestplot = 'Act ' + toRoman(game.act)));

  if (game.act > 1) {
    WinItem();
    WinEquip();
  }

  Brag('a');
}


function Log(line) {
  if (game.log)
    game.log[+new Date()] = line;
  // TODO: and now what?
}

function Task(caption, msec) {
  game.kill = caption + "...";
  if (Kill)
    Kill.text(game.kill);
  Log(game.kill);
  TaskBar.reset(msec);
}

function Add(list, key, value) {
  Put(list, key, value + GetI(list,key));

  /*$IFDEF LOGGING*/
  if (!value) return;
  var line = (value > 0) ? "Gained" : "Lost";
  if (key == 'Gold') {
    key = "gold piece";
    line = (value > 0) ? "Got paid" : "Spent";
  }
  if (value < 0) value = -value;
  line = line + ' ' + Indefinite(key, value);
  Log(line);
  /*$ENDIF*/
}

function AddR(list, key, value) {
  Put(list, key, toRoman(value + toArabic(Get(list,key))));
}

function Get(list, key) {
  if (list.fixedkeys) {
    if (typeof key === typeof 1)
      key = list.fixedkeys[key];
    return game[list.id][key];
  } else if (typeof key === typeof 1) {
    if (key < game[list.id].length)
      return game[list.id][key][1];
    else
      return "";
  } else {
    for (var i = 0; i < game[list.id].length; ++i) {
      if (game[list.id][i][0] === key)
        return game[list.id][i][1];
    }
    return "";
  }
}

function GetI(list, key) {
  return StrToIntDef(Get(list,key), 0);
}

function Min(a,b) {
  return a < b ? a : b;
}

function Max(a,b) {
  return a > b ? a : b;
}

function LevelUp() {
  Add(Traits,'Level',1);
  Add(Stats,'HP Max', GetI(Stats,'CON').div(3) + 1 + Random(4));
  Add(Stats,'MP Max', GetI(Stats,'INT').div(3) + 1 + Random(4));
  WinStat();
  WinStat();
  WinSpell();
  ExpBar.reset(LevelUpTime(GetI(Traits,'Level')));
  Brag('l');
  
  if (getPlayerLevel() >= 10) {
	turboEnabledCaption.style.display = "inline-block"
	turboDisabledCaption.style.display = "none"
	turboButton.disabled = false;
	turboButton.style.backgroundColor = '';
  } else {
	turboButton.disabled = true;
	turboButton.style.backgroundColor = 'grey';
	turboEnabledCaption.style.display = "none"
	turboDisabledCaption.style.display = "inline-block"

  }
}

function ClearAllSelections() {
  $.each(AllLists, function () {this.ClearSelection();});
}

function RoughTime(s) {
  if (s < 120) return s.div(1) + ' seconds';
  else if (s < 60 * 120) return s.div(60) + ' minutes';
  else if (s < 60 * 60 * 48) return s.div(3600) + ' hours';
  else if (s < 60 * 60 * 24 * 60) return s.div(3600 * 24) + ' days';
  else if (s < 60 * 60 * 24 * 30 * 24) return s.div(3600 * 24 * 30) +" months";
  else return s.div(3600 * 24 * 30 * 12) + " years";

}

function Pos(needle, haystack) {
  return haystack.indexOf(needle) + 1;
}

var dealing = false;

var gameSpeedMultiplier = 1; // Default speed multiplier

function setGameSpeed(multiplier) {
    gameSpeedMultiplier = multiplier;
    console.log("Game speed set to " + gameSpeedMultiplier);
}

function Timer1Timer() {
  if (TaskBar.done()) {
    game.tasks += 1;
    game.elapsed += TaskBar.Max().div(1000);

    ClearAllSelections();

    if (game.kill == 'Loading....')
      TaskBar.reset(0);  // Not sure if this is still the ticket

    // gain XP / level up
    var gain = Pos('kill|', game.task) == 1;
    if (gain) {
      if (ExpBar.done())
        LevelUp();
      else
        ExpBar.increment(TaskBar.Max() / 1000);
    }

    // advance quest
    if (gain && game.act >= 1) {
      if (QuestBar.done() || !Quests.length()) {
        CompleteQuest();
      } else {
        QuestBar.increment(TaskBar.Max() / 1000);
      }
    }

    // advance plot
    if (gain || !game.act) {
      if (PlotBar.done())
        InterplotCinematic();
      else
        PlotBar.increment(TaskBar.Max() / 1000);
    }

    Dequeue();
  } else {
    var elapsed = (timeGetTime() - clock.lasttick) * gameSpeedMultiplier;
    if (elapsed > 1000) elapsed = 1000;
    if (elapsed < 0) elapsed = 0;
    TaskBar.increment(elapsed);
  }

  StartTimer();
}

function FormCreate() {
  ExpBar =   new ProgressBar("ExpBar", "$remaining XP needed for next level");
  EncumBar = new ProgressBar("EncumBar", "$position/$max cubits");
  PlotBar =  new ProgressBar("PlotBar", "$time remaining");
  QuestBar = new ProgressBar("QuestBar", "$percent% complete");
  TaskBar =  new ProgressBar("TaskBar", "$percent%");

  AllBars = [ExpBar,PlotBar,TaskBar,QuestBar,EncumBar];

  Traits =    new ListBox("Traits",    2, K.Traits);
  Stats =     new ListBox("Stats",     2, K.Stats);
  Spells =    new ListBox("Spells",    2);
  Equips =    new ListBox("Equips",    2, K.Equips);
  Inventory = new ListBox("Inventory", 2);
  Plots =     new ListBox("Plots",  1);
  Quests =    new ListBox("Quests", 1);

  Plots.load = function (sheet) {
    for (var i = Max(0, game.act-99); i <= game.act; ++i)
      this.AddUI(i ? 'Act ' + toRoman(i) : "Prologue");

  };

  AllLists = [Traits,Stats,Spells,Equips,Inventory,Plots,Quests];

  if (document) {
    Kill = $("#Kill");

    $("#quit").click(quit);

    $(document).keypress(FormKeyDown);

    $(document).bind('beforeunload', function () {
      if (!storage)
        return "Are you sure you want to quit? All your progress will be lost!";
    });

    $(window).on('unload', function (event) {
      StopTimer();
      SaveGame();
      if (storage.async) {
        // Have to give SQL transaction a chance to complete
        if (window.showModalDialog)
          pause(100);

        // Just accept some data loss - alert is too ugly. Maybe increase save
        // frequency.
        // else alert("Game saved");
      }
    });

    if (iOS) $("body").addClass("iOS");
  }

  var name = unescape(window.location.href.split('#')[1]);
  storage.loadSheet(name, LoadGame);

  if (window.opener) {
    // Opened as a popup, so go bare style
    prepPopup();
  }
}

function prepPopup() {
  document.body.classList.add("bare");
  window.resizeBy($("#main")[0].offsetWidth - window.innerWidth,
                  $("#main")[0].offsetHeight - window.innerHeight);

  let titlebar = $("#titlebar");
  let delta;

  titlebar.on("mousedown", e => {
      delta = {
          x: e.pageX,
          y: e.pageY
      };
      console.log(delta);
  });

  $("html").on("mouseup", e => { delta = null; });

  $("html").on("mousemove", e => {
    if (!e.which) delta = null;
    if (delta) {
        window.moveBy(e.pageX - delta.x,
                      e.pageY - delta.y);
    }
  });
}


function pause(msec) {
  window.showModalDialog("javascript:document.writeln ('<script>window.setTimeout(" +
                         "function () { window.close(); }," + msec + ");</script>')",
                         null,
                         "dialogWidth:0;dialogHeight:0;dialogHide:yes;unadorned:yes;"+
                  "status:no;scroll:no;center:no;dialogTop:-10000;dialogLeft:-10000");
}

function quit() {
  $(window).unbind('unload');
  SaveGame(() => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = "roster.html";
    }
  });
}


function HotOrNot() {
  // Figure out which spell is best
  if (Spells.length()) {
    var flat = 1;  // Flattening constant
    var best = 0, i;
    for (i = 1; i < Spells.length(); ++i) {
      if ((i+flat) * toArabic(Get(Spells,i)) >
          (best+flat) * toArabic(Get(Spells,best)))
        best = i;
    }
    game.bestspell = Spells.label(best) + ' ' + Get(Spells, best);
  } else {
    game.bestspell = '';
  }

  /// And which stat is best?
  best = 0;
  for (i = 1; i <= 5; ++i) {
    if (GetI(Stats,i) > GetI(Stats,best))
      best = i;
  }
  game.beststat = Stats.label(best) + ' ' + GetI(Stats, best);
}


function SaveGame(callback) {
  Log('Saving game: ' + GameSaveName());
  HotOrNot();
  game.date = ''+new Date();
  game.stamp = +new Date();
  game.seed = randseed();
  storage.addToRoster(game, callback);
}

function LoadGame(sheet) {
  if (!sheet) {
    alert("Error loading game");
    window.location.href = "roster.html";
    return;
  }

  game = sheet;

  if (document) {
    var title = "Progress Quest - " + GameSaveName();
    $("#title").text(title);
    if (iOS) title = GameSaveName();
    document.title = title;
  }

  randseed(game.seed);
  $.each(AllBars.concat(AllLists), function (i, e) { e.load(game); });
  if (Kill)
    Kill.text(game.kill);
  ClearAllSelections();
  $.each([Plots,Quests], function () {
    this.CheckAll(true);
  });

  // Patch correctly spelled spells showing up as new spells when
  // the incorretly spelled spell was there already.
  function patch(from, to) {
    function count(spell) {
      let t = game.Spells.filter(a => a[0] == spell);
      return t.length == 1 ? toArabic(t[0][1]) : 0;
    }
    let tf = count(from);
    if (!tf) return;
    let tt = count(to);
    let total = tf + tt;
    console.log('Patching ' + from + ' to ' + to);
    game.Spells = game.Spells.filter(a => a[0] != to);
    for (let spell of game.Spells) {
      if (spell[0] == from) {
        spell[0] = to;
        spell[1] = toRoman(total);
      }
    }
  }
  patch('Innoculate', 'Inoculate');
  patch('Tonsilectomy', 'Tonsillectomy');

  Log('Loaded game: ' + game.Traits.Name);
  if (!game.elapsed)
    Brag('s');
  StartTimer();

// handle turbo button
  if (getPlayerLevel() >= 10) {
	turboEnabledCaption.style.display = "inline-block"
	turboDisabledCaption.style.display = "none"
	turboButton.disabled = false;
	turboButton.style.backgroundColor = '';
  } else {
	turboButton.disabled = true;
	turboButton.style.backgroundColor = 'grey';
	turboEnabledCaption.style.display = "none"
	turboDisabledCaption.style.display = "inline-block"
  }  
}

function GameSaveName() {
  if (!game.saveName) {
    game.saveName = Get(Traits, 'Name');
    if (game.online)
      game.saveName += ' [' + game.online.realm + ']';
  }
  return game.saveName;
}


function InputBox(message, def) {
  return prompt(message, def || '');
}

function ToDna(s) {
  s = s + "";
  var code = {
    '0': "AT",
    '1': "AG",
    '2': "AC",
    '3': "TA",
    '4': "TG",
    '5': "TC",
    '6': "GA",
    '7': "GT",
    '8': "GC",
    '9': "CA",
    ',': "CT",
    '.': "CG"
  };
  var r = "";
  for (var i = 0; i < s.length; ++i) {
    r += code[s[i]];
    if (i && (i % 4) == 0) r += " ";
  }
  return r;
}

window.onerror = function(message, source, lineno, colno, error) {
  $("#bsod_message").text(message);
  $("#bsod_source").text(source);
  $("#bsod_lineno").text(lineno);
  $("#bsod_colno").text(colno);
  $("#bsod_error").text(error.stack);

  $("#bsodmom").show();
};

function FormKeyDown(e) {
  $("#bsodmom").hide();

  if (e.key === 'd') {
    alert("Your character's genome is " + ToDna(game.dna + ""));
  }

  if (game.online) {
    if (e.key === 'b') {
      Brag('b', true);
    }

    if (e.key === 'g') {
      Guildify(InputBox('Choose a guild.\n\nMake sure you understand the guild rules before you join one. To learn more about guilds, visit http://progressquest.com/guilds.php\n', game.guild));
    }

    if (e.key === 'm') {
      let mot = InputBox('Declare your motto!', game.motto);
      if (mot !== null) {
        game.motto = mot;
        Brag('m', true);
      }
    }
  }

  if (e.key === 'p') {
    if (clock && clock.running) {
      $('#paused').css('display', 'block');
      StopTimer();
    } else {
      $('#paused').css('display', '');
      StartTimer();
    }
  }

  if (e.key === 'q') {
    quit();
  }

  if (e.key === 's') {
    SaveGame();
    alert('Saved (' + JSON.stringify(game).length + ' bytes).');
  }

  if (e.key === 'w') {
    if (window.opener) return;
    $(window).unbind('unload');  // we're about to save it anyway
    SaveGame(() => {
      let ext = window.open(window.location.href, "Progress Quest",
        `resizable,width=${$("#main")[0].offsetWidth},height=${$("#main")[0].offsetHeight},popup,location=0`);
      console.log(ext);
      if(ext && !ext.closed && typeof ext.closed !== 'undefined') {
        // popup was apparently not blocked
        window.location.href = "roster.html";  // this window can go back to the roster
      }
    });
  }

  /*
  if (e.key === 't') {
    TaskBar.reposition(TaskBar.Max());
  }
  */
}

function Navigate(url) {
  window.open(url);
}

function LFSR(pt, salt) {
  var result = salt;
  for (var k = 0; k < pt.length; ++k)
    result = (result << 1) ^ (1 & ((result >> 31) ^ (result >> 5))) ^ pt.charCodeAt(k);
  for (var kk = 0; kk < 10; ++kk)
    result = (result << 1) ^ (1 & ((result >> 31) ^ (result >> 5)));
  return result;
}

function StandardizeUrl(url) {
  // This shit fucks up some special characters. JQuery is going to do this anyway so
  // we need it standardized before we compute a validator.
  let a = document.createElement('a');
  a.href = url;
  return a.href;
  // TODO we could probably remove all those UrlEncode's before this is called
}

function Validator(url) {
  url = url.substr(url.indexOf("cmd="));
  return IntToStr(LFSR(url, game.online.passkey));
}

function Brag(trigger, andSeeIt) {
  SaveGame();

  if (game.online) {
    // game.bragtrigger = trigger;
    // $.post("webrag.php", game, function (data, textStatus, request) {
    //   if (data.alert)
    //     alert(data.alert);
    // }, "json");

    let url = game.online.host + 'cmd=b&t=' + trigger;
    for (trait in game.Traits) {
      url += '&' + LowerCase(trait.substr(0,1)) + '=' + UrlEncode(game.Traits[trait]);
    }
    url += '&x=' + IntToStr(ExpBar.Position());
    url += '&i=' + UrlEncode(game.bestequip);
    url += '&z=' + UrlEncode(game.bestspell);
    url += '&k=' + UrlEncode(game.beststat);

    url += '&a=' + UrlEncode(game.bestplot);
    url += '&h=' + UrlEncode(game.online.realm);
    url += RevString;
    url = StandardizeUrl(url);
    url += '&p=' + Validator(url);
    url += '&m=' + UrlEncode(game.motto || '');

    $.ajax(url)
    .then(body => {
      if (LowerCase(Split(body,0)) == 'report') {
        alert(Split(body,1));
      } else if (andSeeIt) {
        Navigate(game.online.host + 'name=' + UrlEncode(Get(Traits,'Name')));
      }
    });
  }
}


function Guildify(guild) {
  if (!game.online) return;
  if (guild === null) return;  // input box cancelled

  game.guild = guild;

  let url = game.online.host + 'cmd=guild';
  for (trait in game.Traits) {
    url += '&' + LowerCase(trait.substr(0,1)) + '=' + UrlEncode(game.Traits[trait]);
  }
  url += '&h=' + UrlEncode(game.online.realm);
  url += RevString;
  url += '&guild=' + UrlEncode(game.guild);
  url = StandardizeUrl(url);
  url += '&p=' + Validator(url);

  $.ajax(url)
  .then(body => {
    let parts = body.split('|');
    let s = parts.shift();
    if (s) alert(s);
    s = parts.shift();
    if (s) Navigate(s);
  });
}

// Function to generate a hash from the game state
async function generateHash(game) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(game));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
// Example usage
//generateHash(game).then(hash => {
//  updateMandelbulb(hash);
//});
