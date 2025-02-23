function Cheats() {
  if ($(".cheater").length) return;

  function cheat(label, effect) {
    $("<button/>", {
      "class": "cheater",
      text: label,
      click: effect}).appendTo('body');
  }

  cheat("Complete Task", function () {
    TaskBar.reposition(TaskBar.Max());
  });

  cheat("LevelUp", function () {
    LevelUp();
  });

  cheat("Adv Quest", function () {
    QuestBar.reposition(QuestBar.Max());
    TaskBar.reposition(TaskBar.Max());
  });

  cheat("Adv Plot", function () {
    PlotBar.reposition(PlotBar.Max());
    TaskBar.reposition(TaskBar.Max());
  });

  cheat("Pause", function () {
    if (clock && clock.running) {
      StopTimer();
    } else {
      StartTimer();
    }
  });

  cheat("Break", function () {
    debugger;
  });
  cheat("Equip", function () {
    WinEquip();
  });

  cheat("+Item", function () {
    WinItem();
  });

  cheat("Clear Inv", function () {
    while (Inventory.length() > 1)
      Inventory.remove1();
  });

// New Speed button
    cheat("Game Speed", function () {
        var newSpeed = prompt("Enter new game speed multiplier:", gameSpeedMultiplier);
        if (newSpeed !== null) {
            setGameSpeed(parseFloat(newSpeed));
        }
    });

  cheat("+Spell", function () {
    WinSpell();
  });

  cheat("+Stat", function () {
    WinStat();
  });

cheat("$$$", function () {
  let currentGold = GetI(Inventory, 'Gold');
  let additionalGold;

  if (currentGold <= 100) {
    additionalGold = 100;
  } else {
	additionalGold = Math.floor(100 * Math.pow(1.05, currentGold / 100));
  }

  Add(Inventory, 'Gold', additionalGold);
});


  cheat("Save", function () {
    SaveGame();
    alert(JSON.stringify(game).length);
  });

  cheat("Quit", quit);
  
  cheat("RandomTask (for fun)", function () {
	var result;
	result = randomTask();
    console.log(result);
  });
}
