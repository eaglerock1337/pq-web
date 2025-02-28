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

cheat("$$$", addScaledGold());


  cheat("Save", function () {
    SaveGame();
    alert(JSON.stringify(game).length);
  });

  cheat("Quit", quit);
  
  cheat("RandomTask (for fun)", function () {
	var result;
	result = Pick([
		randomTask(),
		randomTaskToo(),
		diplomaticMission(),
		sideQuestStorySample(),
		generateSideQuest(),
		wallyBfeed(getRandomInt(3,12))
	]);
    console.log(result);
  });
  
  // New Side Quest button
  cheat("Side Quest", function () {
	// Complete the current quest cleanly
	if (game.task && game.task !== 'sideQuest') {
		CompleteQuest(true); // Handles rewards, updates quest log, resets QuestBar
	}

	// Force current task completion and process it
	if (!TaskBar.done()) {
		TaskBar.reposition(TaskBar.Max()); // Finish current task
		Dequeue(); // Process the completion immediately
	}

	// Start the side quest
	doSideQuest();
	console.log("Side Quest queued: " + game.bestquest);
  });
}
